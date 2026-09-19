export const TELEGRAM_TEXT_LIMIT = 4_000;
export const MAX_UPDATE_BYTES = 64_000;

export function commandArguments(text: string): string {
  return text.replace(/^\/[^\s@]+(?:@[^\s]+)?\s*/i, "").trim();
}

export function boundedText(text: string, max = TELEGRAM_TEXT_LIMIT): string | null {
  const value = text.trim();
  return value.length > 0 && value.length <= max ? value : null;
}
