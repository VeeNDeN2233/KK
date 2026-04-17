type Bucket = {
  resetAt: number;
  count: number;
};

const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, opts: { windowMs: number; max: number }) {
  const now = Date.now();
  const b = buckets.get(key);

  if (!b || now >= b.resetAt) {
    buckets.set(key, { resetAt: now + opts.windowMs, count: 1 });
    return { ok: true as const, remaining: opts.max - 1, resetAt: now + opts.windowMs };
  }

  if (b.count >= opts.max) {
    return { ok: false as const, remaining: 0, resetAt: b.resetAt };
  }

  b.count += 1;
  return { ok: true as const, remaining: Math.max(0, opts.max - b.count), resetAt: b.resetAt };
}

export function getClientIpFromReq(req: { headers?: Record<string, string | string[] | undefined> }) {
  const raw = req.headers?.["x-forwarded-for"];
  const first = Array.isArray(raw) ? raw[0] : raw;
  if (first) return first.split(",")[0]?.trim() || null;
  const realIp = req.headers?.["x-real-ip"];
  return (Array.isArray(realIp) ? realIp[0] : realIp) ?? null;
}

