import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { getAuthSecret } from "@/lib/authSecret";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export async function POST(req: NextRequest) {
  const token = await getToken({ req, secret: getAuthSecret() }).catch(() => null);
  const email = typeof token?.email === "string" ? token.email : null;
  if (!email) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const rl = rateLimit(`me_avatar:${email}:${ip}`, { windowMs: 60_000, max: 20 });
  if (!rl.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "invalid_form" }, { status: 400 });
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file_required" }, { status: 400 });
  }

  if (file.size <= 0) return NextResponse.json({ error: "file_empty" }, { status: 400 });
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "file_too_large" }, { status: 413 });
  }

  const ext = ALLOWED.get(file.type);
  if (!ext) return NextResponse.json({ error: "unsupported_type" }, { status: 415 });

  const uploadsDir = path.join(process.cwd(), "public", "uploads", "avatars");
  await mkdir(uploadsDir, { recursive: true });

  const name = `${crypto.randomUUID()}.${ext}`;
  const abs = path.join(uploadsDir, name);
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(abs, buf);

  // Best-effort cleanup: delete previous local avatar file.
  const prev = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { avatarUrl: true },
  });

  const avatarUrl = `/uploads/avatars/${name}`;
  await prisma.user.update({
    where: { email: email.toLowerCase() },
    data: { avatarUrl },
    select: { id: true },
  });

  const prevUrl = prev?.avatarUrl ?? null;
  if (prevUrl && prevUrl.startsWith("/uploads/avatars/")) {
    const prevName = path.basename(prevUrl);
    if (prevName && prevName !== name) {
      const prevAbs = path.join(uploadsDir, prevName);
      void unlink(prevAbs).catch(() => null);
    }
  }

  return NextResponse.json({ ok: true, avatarUrl });
}

