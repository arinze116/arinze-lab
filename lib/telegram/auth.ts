import crypto from "crypto";

function ids(name: string): Set<number> {
  return new Set((process.env[name] || "").split(",").map((value) => Number(value.trim())).filter((value) => Number.isSafeInteger(value) && value > 0));
}

function adminIds(): Set<number> {
  const configured = ids("TELEGRAM_ADMIN_USER_IDS");
  const singular = Number(process.env.TELEGRAM_ADMIN_USER_ID);
  if (Number.isSafeInteger(singular) && singular > 0) configured.add(singular);
  return configured;
}

export function isAuthorized(userId: number | undefined, chatId: number | undefined): boolean {
  if (!userId) return false;
  const allowedUsers = adminIds();
  if (!allowedUsers.has(userId)) return false;
  const allowedChats = ids("TELEGRAM_ADMIN_CHAT_IDS");
  return allowedChats.size === 0 || (chatId !== undefined && allowedChats.has(chatId));
}

export function verifyWebhookSecret(request: Request): boolean {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  const received = request.headers.get("x-telegram-bot-api-secret-token");
  if (!expected || !received) return false;
  const left = Buffer.from(expected);
  const right = Buffer.from(received);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function genericOperationId(): string {
  return `CMS-${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}-${crypto.randomBytes(3).toString("hex")}`.toUpperCase();
}
