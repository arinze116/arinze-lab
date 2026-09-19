const seen = new Map<number, number>();
const RETENTION = 24 * 60 * 60 * 1000;

async function redisCommand(command: string[]): Promise<unknown> {
  const url = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, "");
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const response = await fetch(`${url}/`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify(command), cache: "no-store" });
  if (!response.ok) throw new Error("Idempotency storage is unavailable.");
  return ((await response.json()) as { result?: unknown }).result;
}

export async function claimUpdate(updateId: number): Promise<boolean> {
  if (!Number.isSafeInteger(updateId)) return false;
  if (process.env.VERCEL && !(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)) throw new Error("Durable Telegram idempotency storage is not configured.");
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const result = await redisCommand(["SET", `arinzelab:cms:update:${updateId}`, "1", "NX", "EX", String(RETENTION / 1000)]);
    return result === "OK";
  }
  const now = Date.now();
  for (const [id, timestamp] of seen) if (now - timestamp > RETENTION) seen.delete(id);
  if (seen.has(updateId)) return false;
  seen.set(updateId, now);
  return true;
}

export async function releaseUpdate(updateId: number): Promise<void> {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    await redisCommand(["DEL", `arinzelab:cms:update:${updateId}`]);
    return;
  }
  seen.delete(updateId);
}
