import { NextResponse } from "next/server";
import { handleTelegramUpdate } from "@/lib/telegram/commands";
import { genericOperationId, isAuthorized, verifyWebhookSecret } from "@/lib/telegram/auth";
import { claimUpdate } from "@/lib/telegram/idempotency";
import type { TelegramUpdate } from "@/lib/telegram/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const rateWindow = new Map<string, { count: number; resetAt: number }>();

function rateLimited(request: Request): boolean {
  const key = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const now = Date.now();
  const entry = rateWindow.get(key);
  if (!entry || entry.resetAt <= now) { rateWindow.set(key, { count: 1, resetAt: now + 60_000 }); return false; }
  entry.count += 1;
  return entry.count > 60;
}

function isTelegramUpdate(value: unknown): value is TelegramUpdate {
  if (!value || typeof value !== "object") return false;
  const update = value as { update_id?: unknown; message?: unknown; callback_query?: unknown };
  if (!Number.isSafeInteger(update.update_id)) return false;
  return Boolean(update.message || update.callback_query);
}

export async function POST(request: Request) {
  if (!verifyWebhookSecret(request)) return NextResponse.json({ ok: false }, { status: 401 });
  if (rateLimited(request)) return NextResponse.json({ ok: false }, { status: 429 });
  let updateForError: TelegramUpdate | undefined;
  try {
    if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") return NextResponse.json({ ok: false }, { status: 415 });
    const raw = await request.text();
    if (raw.length > 64_000) return NextResponse.json({ ok: false }, { status: 413 });
    const parsed: unknown = JSON.parse(raw);
    if (!isTelegramUpdate(parsed)) return NextResponse.json({ ok: false }, { status: 400 });
    const update = parsed;
    updateForError = update;
    const actor = update.message?.from || update.callback_query?.from;
    const chatId = update.message?.chat.id || update.callback_query?.message?.chat.id;
    if (!isAuthorized(actor?.id, chatId)) {
      if (chatId) {
        // Keep denial generic and avoid revealing which part of the allowlist failed.
        try { await import("@/lib/telegram/api").then(({ sendMessage }) => sendMessage(chatId, "This account is not authorized for administration.")); } catch { /* Telegram may be unavailable. */ }
      }
      return NextResponse.json({ ok: true });
    }
    if (!await claimUpdate(update.update_id)) return NextResponse.json({ ok: true });
    await handleTelegramUpdate(update);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const operationId = genericOperationId();
    console.error(`[${operationId}] Telegram CMS webhook failure`, error instanceof Error ? error.message : "unknown error");
    const chatId = updateForError?.message?.chat.id || updateForError?.callback_query?.message?.chat.id;
    if (chatId) {
      try {
        const { sendMessage } = await import("@/lib/telegram/api");
        await sendMessage(chatId, `❌ Something went wrong.\n\nNo changes were published.\nOperation ID: ${operationId}`);
      } catch (notifyError) {
        console.error(`[${operationId}] Telegram error notification failed`, notifyError instanceof Error ? notifyError.message : "unknown error");
      }
    }
    return NextResponse.json({ ok: true, operationId });
  }
}

export function GET() {
  return NextResponse.json({ ok: false }, { status: 405 });
}
