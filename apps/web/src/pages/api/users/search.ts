import type { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { getClientIpFromReq, rateLimit } from "@/lib/rateLimit";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const session = await getServerSession(req, res, authOptions);
  const email = session?.user?.email;
  if (!email) return res.status(401).json({ error: "unauthorized" });

  const ip = getClientIpFromReq(req) ?? "unknown";
  const rl = rateLimit(`users_search:${email}:${ip}`, { windowMs: 60_000, max: 60 });
  if (!rl.ok) return res.status(429).json({ error: "rate_limited" });

  const raw = typeof req.query.q === "string" ? req.query.q : "";
  const q = raw.trim().replace(/^@/, "");
  if (q.length < 2) return res.status(400).json({ error: "query_too_short" });

  const users = await prisma.user.findMany({
    where: {
      username: { not: null },
      OR: [
        { username: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      username: true,
      name: true,
      city: true,
      country: true,
    },
    take: 20,
    orderBy: { username: "asc" },
  });

  const payload = users
    .filter((u): u is typeof u & { username: string } => u.username != null)
    .map((u) => ({
      username: u.username,
      name: u.name,
      city: u.city,
      country: u.country,
    }));

  return res.status(200).json({ users: payload });
}
