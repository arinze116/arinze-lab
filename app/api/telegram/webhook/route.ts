import { NextResponse } from "next/server";
import { handleTelegramUpdate } from "@/lib/telegram/commands";
import { genericOperationId, isAuthorized } from "@/lib/telegram/auth";
import { claimUpdate } from "@/lib/telegram/idempotency";
import type { TelegramUpdate } from "@/lib/telegram/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const rateWindow = new Map<string, { count: number; resetAt: number }>();

function rateLimited(request: Request): boolean {
  const key =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  const now = Date.now();
  const entry = rateWindow.get(key);

  if (!entry || entry.resetAt <= now) {
    rateWindow.set(key, {
      count: 1,
      resetAt: now + 60_000,
    });

    return false;
  }

  entry.count += 1;

  return entry.count > 60;
}

function isTelegramUpdate(value: unknown): value is TelegramUpdate {
  if (!value || typeof value !== "object") {
    return false;
  }

  const update = value as {
    update_id?: unknown;
    message?: unknown;
    callback_query?: unknown;
  };

  if (!Number.isSafeInteger(update.update_id)) {
    return false;
  }

  return Boolean(update.message || update.callback_query);
}

function log(stage: string, data?: Record<string, unknown>) {
  console.log(
    JSON.stringify({
      source: "telegram-webhook",
      stage,
      timestamp: new Date().toISOString(),
      ...data,
    }),
  );
}

export async function POST(request: Request) {
  log("request_received", {
    method: request.method,
    contentType: request.headers.get("content-type"),
  });

  if (rateLimited(request)) {
    log("rate_limited");

    return NextResponse.json(
      {
        ok: false,
      },
      {
        status: 429,
      },
    );
  }

  let updateForError: TelegramUpdate | undefined;

  try {
    const contentType = request.headers
      .get("content-type")
      ?.split(";")[0]
      .trim()
      .toLowerCase();

    if (contentType !== "application/json") {
      log("invalid_content_type", {
        contentType,
      });

      return NextResponse.json(
        {
          ok: false,
        },
        {
          status: 415,
        },
      );
    }

    const raw = await request.text();

    log("body_received", {
      bodyLength: raw.length,
    });

    if (raw.length > 64_000) {
      log("body_too_large");

      return NextResponse.json(
        {
          ok: false,
        },
        {
          status: 413,
        },
      );
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(raw);
    } catch {
      log("invalid_json");

      return NextResponse.json(
        {
          ok: false,
        },
        {
          status: 400,
        },
      );
    }

    if (!isTelegramUpdate(parsed)) {
      log("invalid_telegram_update");

      return NextResponse.json(
        {
          ok: false,
        },
        {
          status: 400,
        },
      );
    }

    const update = parsed;
    updateForError = update;

    const actor =
      update.message?.from ||
      update.callback_query?.from;

    const chatId =
      update.message?.chat.id ||
      update.callback_query?.message?.chat.id;

    const updateType = update.message
      ? "message"
      : update.callback_query
        ? "callback_query"
        : "unknown";

    const command =
      update.message?.text?.startsWith("/")
        ? update.message.text.split(/\s+/)[0]
        : undefined;

    log("update_parsed", {
      updateId: update.update_id,
      updateType,
      userId: actor?.id,
      chatId,
      command,
    });

    const authorized = isAuthorized(actor?.id, chatId);

    log("authorization_checked", {
      updateId: update.update_id,
      userId: actor?.id,
      chatId,
      authorized,
    });

    if (!authorized) {
      log("authorization_denied", {
        updateId: update.update_id,
        userId: actor?.id,
        chatId,
      });

      if (chatId) {
        try {
          log("unauthorized_message_attempt", {
            chatId,
          });

          const { sendMessage } =
            await import("@/lib/telegram/api");

          await sendMessage(
            chatId,
            "This account is not authorized for administration.",
          );

          log("unauthorized_message_sent", {
            chatId,
          });
        } catch (error) {
          log("unauthorized_message_failed", {
            chatId,
            error:
              error instanceof Error
                ? error.message
                : "unknown error",
          });
        }
      }

      return NextResponse.json({
        ok: true,
      });
    }

    log("authorization_passed", {
      updateId: update.update_id,
    });

    let claimed: boolean;

    try {
      log("idempotency_claim_attempt", {
        updateId: update.update_id,
      });

      claimed = await claimUpdate(update.update_id);

      log("idempotency_claim_result", {
        updateId: update.update_id,
        claimed,
      });
    } catch (error) {
      log("idempotency_claim_failed", {
        updateId: update.update_id,
        error:
          error instanceof Error
            ? error.message
            : "unknown error",
      });

      throw error;
    }

    if (!claimed) {
      log("duplicate_update_ignored", {
        updateId: update.update_id,
      });

      return NextResponse.json({
        ok: true,
      });
    }

    log("command_handler_start", {
      updateId: update.update_id,
      command,
    });

    try {
      await handleTelegramUpdate(update);

      log("command_handler_success", {
        updateId: update.update_id,
        command,
      });
    } catch (error) {
      log("command_handler_failed", {
        updateId: update.update_id,
        command,
        error:
          error instanceof Error
            ? error.message
            : "unknown error",
      });

      throw error;
    }

    log("request_completed", {
      updateId: update.update_id,
    });

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    const operationId = genericOperationId();

    log("webhook_failure", {
      operationId,
      error:
        error instanceof Error
          ? error.message
          : "unknown error",
    });

    console.error(
      `[${operationId}] Telegram CMS webhook failure`,
      error instanceof Error
        ? error.message
        : "unknown error",
    );

    const chatId =
      updateForError?.message?.chat.id ||
      updateForError?.callback_query?.message?.chat.id;

    if (chatId) {
      try {
        log("error_notification_attempt", {
          operationId,
          chatId,
        });

        const { sendMessage } =
          await import("@/lib/telegram/api");

        await sendMessage(
          chatId,
          `❌ Something went wrong.\n\nNo changes were published.\nOperation ID: ${operationId}`,
        );

        log("error_notification_sent", {
          operationId,
          chatId,
        });
      } catch (notifyError) {
        log("error_notification_failed", {
          operationId,
          chatId,
          error:
            notifyError instanceof Error
              ? notifyError.message
              : "unknown error",
        });

        console.error(
          `[${operationId}] Telegram error notification failed`,
          notifyError instanceof Error
            ? notifyError.message
            : "unknown error",
        );
      }
    }

    return NextResponse.json({
      ok: true,
      operationId,
    });
  }
}

export function GET() {
  log("invalid_get_request");

  return NextResponse.json(
    {
      ok: false,
    },
    {
      status: 405,
    },
  );
}