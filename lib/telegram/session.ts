import crypto from "crypto";
import type { CmsSession } from "@/lib/cms/schema";

const SESSION_TTL = 45 * 60 * 1000;
const memory = new Map<string, CmsSession>();

function redisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

function requireDurableStore() {
  if (process.env.VERCEL && !redisConfig()) throw new Error("Durable Telegram session storage is not configured.");
}

async function redisCommand(command: string[]): Promise<unknown> {
  const config = redisConfig();
  if (!config) return null;
  const response = await fetch(`${config.url}/`, { method: "POST", headers: { Authorization: `Bearer ${config.token}`, "Content-Type": "application/json" }, body: JSON.stringify(command), cache: "no-store" });
  if (!response.ok) throw new Error("Session storage is unavailable.");
  const data = (await response.json()) as { result?: unknown };
  return data.result;
}

function cleanupMemory() {
  const now = Date.now();
  for (const [id, session] of memory) if (session.expiresAt <= now) memory.delete(id);
}

export async function createSession(userId: number, chatId: number, action: string, draft: Record<string, unknown> = {}): Promise<string> {
  requireDurableStore();
  const id = crypto.randomBytes(10).toString("hex");
  const session: CmsSession = { id, userId, chatId, action, step: "start", draft, expiresAt: Date.now() + SESSION_TTL };
  const stored = JSON.stringify(session);
  if (redisConfig()) await redisCommand(["SET", `arinzelab:cms:session:${id}`, stored, "PX", String(SESSION_TTL)]);
  else {
    cleanupMemory();
    memory.set(id, session);
  }
  if (redisConfig()) await redisCommand(["SET", `arinzelab:cms:active:${userId}:${chatId}`, id, "PX", String(SESSION_TTL)]);
  else memory.set(`active:${userId}:${chatId}`, session);
  return id;
}

export async function readSession(id: string): Promise<CmsSession | null> {
  requireDurableStore();
  if (!/^[a-f0-9]{20}$/.test(id)) return null;
  const raw = redisConfig() ? await redisCommand(["GET", `arinzelab:cms:session:${id}`]) : (cleanupMemory(), memory.get(id));
  if (!raw) return null;
  const session = typeof raw === "string" ? JSON.parse(raw) as CmsSession : raw as CmsSession;
  return session.expiresAt > Date.now() ? session : null;
}

export async function saveSession(session: CmsSession): Promise<void> {
  requireDurableStore();
  session.expiresAt = Date.now() + SESSION_TTL;
  if (redisConfig()) await redisCommand(["SET", `arinzelab:cms:session:${session.id}`, JSON.stringify(session), "PX", String(SESSION_TTL)]);
  else memory.set(session.id, session);
  if (redisConfig()) await redisCommand(["SET", `arinzelab:cms:active:${session.userId}:${session.chatId}`, session.id, "PX", String(SESSION_TTL)]);
  else memory.set(`active:${session.userId}:${session.chatId}`, session);
}

export async function deleteSession(id: string): Promise<void> {
  requireDurableStore();
  const session = await readSession(id);
  if (redisConfig()) {
    await redisCommand(["DEL", `arinzelab:cms:session:${id}`]);
    if (session) await redisCommand(["DEL", `arinzelab:cms:active:${session.userId}:${session.chatId}`]);
  }
  memory.delete(id);
  if (session) memory.delete(`active:${session.userId}:${session.chatId}`);
}

export async function getActiveSession(userId: number, chatId: number): Promise<CmsSession | null> {
  requireDurableStore();
  const id = redisConfig() ? await redisCommand(["GET", `arinzelab:cms:active:${userId}:${chatId}`]) : undefined;
  if (typeof id === "string") return readSession(id);
  const local = memory.get(`active:${userId}:${chatId}`);
  return local && local.expiresAt > Date.now() ? local : null;
}

export function sessionButton(id: string, label: string, action: "publish" | "edit" | "cancel"): { text: string; callback_data: string } {
  return { text: label, callback_data: `session:${id}:${action}` };
}
