import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const BodySchema = z.object({
  text: z.string().min(1).max(2000),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const conversationId = String(req.query.conversationId ?? "");
  if (!conversationId) return res.status(400).json({ error: "missing_conversationId" });

  const session = await getServerSession(req, res, authOptions);
  const email = session?.user?.email;
  if (!email) return res.status(401).json({ error: "unauthorized" });

  const me = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!me) return res.status(401).json({ error: "unauthorized" });

  const convo = await prisma.conversation.findFirst({
    where: { id: conversationId, participants: { some: { userId: me.id } } },
    select: { id: true },
  });
  if (!convo) return res.status(404).json({ error: "not_found" });

  if (req.method === "GET") {
    const messages = await prisma.message.findMany({
      where: { conversationId: convo.id },
      orderBy: { createdAt: "asc" },
      take: 200,
      select: {
        id: true,
        text: true,
        createdAt: true,
        fromUser: { select: { email: true, username: true, name: true } },
      },
    });
    return res.status(200).json({ ok: true, messages });
  }

  if (req.method === "POST") {
    const parsed = BodySchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "invalid_payload" });

    const msg = await prisma.message.create({
      data: {
        conversationId: convo.id,
        fromUserId: me.id,
        text: parsed.data.text,
      },
      select: { id: true },
    });

    await prisma.conversation.update({
      where: { id: convo.id },
      data: { updatedAt: new Date() },
    });

    return res.status(200).json({ ok: true, messageId: msg.id });
  }

  return res.status(405).end();
}

