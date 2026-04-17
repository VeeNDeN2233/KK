import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { getClientIpFromReq, rateLimit } from "@/lib/rateLimit";

const BodySchema = z.object({
  username: z.string().min(0).max(32).nullable().optional(),
  name: z.string().min(0).max(64).nullable().optional(),
  city: z.string().min(0).max(64).nullable().optional(),
  country: z.string().min(0).max(64).nullable().optional(),
  avatarUrl: z.string().min(0).max(500).nullable().optional(),
  tradeByMail: z.boolean().optional(),
  tradeInPerson: z.boolean().optional(),
});

function normNullableString(v: string | null | undefined) {
  if (v === undefined) return undefined;
  if (v === null) return null;
  const t = v.trim();
  return t.length ? t : null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "PATCH") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  const email = session?.user?.email;
  if (!email) return res.status(401).json({ error: "unauthorized" });

  const ip = getClientIpFromReq(req) ?? "unknown";
  const rl = rateLimit(`me_profile:${email}:${ip}`, { windowMs: 60_000, max: 30 });
  if (!rl.ok) return res.status(429).json({ error: "rate_limited" });

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_payload" });

  const usernameRaw = parsed.data.username;
  const usernameNorm = normNullableString(usernameRaw);
  const username =
    usernameNorm === undefined
      ? undefined
      : usernameNorm === null
        ? null
        : usernameNorm.replace(/^@/, "");

  const data = {
    username,
    name: normNullableString(parsed.data.name),
    city: normNullableString(parsed.data.city),
    country: normNullableString(parsed.data.country),
    avatarUrl: normNullableString(parsed.data.avatarUrl),
    tradeByMail: parsed.data.tradeByMail,
    tradeInPerson: parsed.data.tradeInPerson,
  } as const;

  try {
    const updated = await prisma.user.update({
      where: { email: email.toLowerCase() },
      data,
      select: {
        email: true,
        username: true,
        name: true,
        city: true,
        country: true,
        avatarUrl: true,
        tradeByMail: true,
        tradeInPerson: true,
      },
    });
    return res.status(200).json({ ok: true, user: updated });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return res.status(409).json({ error: "username_taken" });
    }
    return res.status(500).json({ error: "internal_error" });
  }
}

