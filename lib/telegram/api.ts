import type { TelegramSendOptions } from "@/lib/telegram/types";

function botConfig() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not configured.");
  return token;
}

async function telegramRequest<T>(method: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`https://api.telegram.org/bot${botConfig()}/${method}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), cache: "no-store" });
  const data = (await response.json()) as { ok: boolean; result?: T; description?: string };
  if (!response.ok || !data.ok) throw new Error(`Telegram API ${method} failed: ${data.description || response.statusText}`);
  return data.result as T;
}

export function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function truncateTelegram(value: string, max = 3_500): string {
  return value.length <= max ? value : `${value.slice(0, max - 30)}\n… [truncated]`;
}

export function sendMessage(chatId: number, text: string, options?: TelegramSendOptions) {
  return telegramRequest<{ message_id: number }>("sendMessage", { chat_id: chatId, text: truncateTelegram(text), ...options });
}

export function answerCallbackQuery(callbackQueryId: string, text?: string) {
  return telegramRequest<boolean>("answerCallbackQuery", { callback_query_id: callbackQueryId, text });
}

export function getFile(fileId: string) {
  return telegramRequest<{ file_path?: string }>("getFile", { file_id: fileId });
}

export async function downloadFile(fileId: string): Promise<{ bytes: Buffer; filePath?: string }> {
  const file = await getFile(fileId);
  if (!file.file_path) throw new Error("Telegram file path is unavailable.");
  const response = await fetch(`https://api.telegram.org/file/bot${botConfig()}/${file.file_path}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Telegram file download failed.");
  return { bytes: Buffer.from(await response.arrayBuffer()), filePath: file.file_path };
}
