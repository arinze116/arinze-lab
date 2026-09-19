import assert from "node:assert/strict";
import test from "node:test";
import { isAuthorized, verifyWebhookSecret } from "../lib/telegram/auth";

test("Telegram authorization requires an allowlisted numeric user", () => {
  const previous = {
    ids: process.env.TELEGRAM_ADMIN_USER_IDS,
    singular: process.env.TELEGRAM_ADMIN_USER_ID,
    chats: process.env.TELEGRAM_ADMIN_CHAT_IDS,
  };
  process.env.TELEGRAM_ADMIN_USER_IDS = "12345";
  delete process.env.TELEGRAM_ADMIN_USER_ID;
  delete process.env.TELEGRAM_ADMIN_CHAT_IDS;
  assert.equal(isAuthorized(12345, 999), true);
  assert.equal(isAuthorized(99999, 999), false);
  process.env.TELEGRAM_ADMIN_CHAT_IDS = "888";
  assert.equal(isAuthorized(12345, 999), false);
  assert.equal(isAuthorized(12345, 888), true);
  if (previous.ids === undefined) delete process.env.TELEGRAM_ADMIN_USER_IDS; else process.env.TELEGRAM_ADMIN_USER_IDS = previous.ids;
  if (previous.singular === undefined) delete process.env.TELEGRAM_ADMIN_USER_ID; else process.env.TELEGRAM_ADMIN_USER_ID = previous.singular;
  if (previous.chats === undefined) delete process.env.TELEGRAM_ADMIN_CHAT_IDS; else process.env.TELEGRAM_ADMIN_CHAT_IDS = previous.chats;
});

test("Telegram webhook secret uses the configured header", () => {
  const previous = process.env.TELEGRAM_WEBHOOK_SECRET;
  process.env.TELEGRAM_WEBHOOK_SECRET = "a-secret-that-is-long-enough";
  assert.equal(verifyWebhookSecret(new Request("https://example.test", { headers: { "x-telegram-bot-api-secret-token": "a-secret-that-is-long-enough" } })), true);
  assert.equal(verifyWebhookSecret(new Request("https://example.test", { headers: { "x-telegram-bot-api-secret-token": "wrong" } })), false);
  if (previous === undefined) delete process.env.TELEGRAM_WEBHOOK_SECRET; else process.env.TELEGRAM_WEBHOOK_SECRET = previous;
});
