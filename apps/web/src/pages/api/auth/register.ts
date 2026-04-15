import type { NextApiRequest, NextApiResponse } from "next";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(3).max(32).optional(),
  name: z.string().min(1).max(64).optional(),
  city: z.string().min(1).max(64).optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const parsed = RegisterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "invalid_payload", issues: parsed.error.issues });
  }

  const { email, password, username, name, city } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const created = await (prisma as any).user.create({
      data: { email, username, name, city, passwordHash },
      select: { id: true },
    });
    return res.status(200).json({ ok: true, userId: created.id });
  } catch {
    return res.status(409).json({ error: "user_exists_or_invalid" });
  }
}

