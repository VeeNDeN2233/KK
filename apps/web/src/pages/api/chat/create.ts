import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { getClientIpFromReq, rateLimit } from "@/lib/rateLimit";

const BodySchema = z.object({
  usernameOrEmail: z.string().min(1).max(200),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  const email = session?.user?.email;
  if (!email) return res.status(401).json({ error: "unauthorized" });

  const ip = getClientIpFromReq(req) ?? "unknown";
  const rl = rateLimit(`chat_create:${ip}`, { windowMs: 60_000, max: 20 });
  if (!rl.ok) return res.status(429).json({ error: "rate_limited" });

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_payload" });

  const raw = parsed.data.usernameOrEmail.trim();
  const isEmail = raw.includes("@");
  const target = await prisma.user.findUnique({
    where: isEmail ? { email: raw.toLowerCase() } : { username: raw.replace(/^@/, "") },
    select: { id: true, email: true },
  });
  if (!target) return res.status(404).json({ error: "user_not_found" });

  const me = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!me) return res.status(401).json({ error: "unauthorized" });
  if (target.id === me.id) return res.status(400).json({ error: "cannot_message_self" });

  // Find an existing 1:1 conversation: both users participate and exactly 2 participants.
  const candidates = await prisma.conversation.findMany({
    where: {
      AND: [
        { participants: { some: { userId: me.id } } },
        { participants: { some: { userId: target.id } } },
      ],
    },
    select: { id: true, _count: { select: { participants: true } } },
    take: 25,
  });
  const existing = candidates.find((c) => c._count.participants === 2) ?? null;
  if (existing) return res.status(200).json({ ok: true, conversationId: existing.id });

  const convo = await prisma.conversation.create({
    data: {
      participants: {
        create: [{ userId: me.id }, { userId: target.id }],
      },
    },
    select: { id: true },
  });

  return res.status(200).json({ ok: true, conversationId: convo.id });
}
