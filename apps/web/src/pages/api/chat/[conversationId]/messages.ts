import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const BodySchema = z.object({
  text: z.string().min(1).max(2000),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  const email = session?.user?.email;
  if (!email) return res.status(401).json({ error: "unauthorized" });

  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: "invalid_payload" });

  const conversationId = String(req.query.conversationId ?? "");
  if (!conversationId) return res.status(400).json({ error: "missing_conversationId" });

  const me = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!me) return res.status(401).json({ error: "unauthorized" });

  const convo = await (prisma as any).conversation.findFirst({
    where: { id: conversationId, participants: { some: { userId: me.id } } },
    select: { id: true },
  });
  if (!convo) return res.status(404).json({ error: "not_found" });

  const msg = await (prisma as any).message.create({
    data: {
      conversationId: convo.id,
      fromUserId: me.id,
      text: parsed.data.text,
    },
    select: { id: true },
  });

  await (prisma as any).conversation.update({
    where: { id: convo.id },
    data: { updatedAt: new Date() },
  });

  return res.status(200).json({ ok: true, messageId: msg.id });
}

