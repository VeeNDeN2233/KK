import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getClientIpFromReq, rateLimit } from "@/lib/rateLimit";
import { Prisma } from "@prisma/client";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(3).max(32).optional(),
  name: z.string().min(1).max(64).optional(),
  city: z.string().min(1).max(64).optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const ip = getClientIpFromReq(req) ?? "unknown";
  const rl = rateLimit(`register:${ip}`, { windowMs: 60_000, max: 10 });
  if (!rl.ok) return res.status(429).json({ error: "rate_limited" });

  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_payload", issues: parsed.error.issues });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const password = parsed.data.password;
  const username = parsed.data.username?.trim().replace(/^@/, "") || undefined;
  const name = parsed.data.name?.trim() || undefined;
  const city = parsed.data.city?.trim() || undefined;
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const created = await prisma.user.create({
      data: { email, username, name, city, passwordHash },
      select: { id: true },
    });
    return res.status(200).json({ ok: true, userId: created.id });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const target = (e.meta?.target ?? []) as string[] | string;
      const fields = Array.isArray(target) ? target : [target];
      if (fields.includes("email")) return res.status(409).json({ error: "email_taken" });
      if (fields.includes("username")) return res.status(409).json({ error: "username_taken" });
      return res.status(409).json({ error: "conflict" });
    }
    if (e instanceof Prisma.PrismaClientInitializationError) {
      return res.status(503).json({ error: "db_unavailable" });
    }
    return res.status(500).json({ error: "internal_error" });
  }
}

