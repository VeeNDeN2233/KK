import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getClientIpFromReq, rateLimit } from "@/lib/rateLimit";
import { getAuthSecret } from "@/lib/authSecret";

const CredentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  secret: getAuthSecret(),
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const parsed = CredentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const headers =
          (req as { headers?: Record<string, string | string[] | undefined> } | undefined)?.headers ??
          undefined;
        const ip = getClientIpFromReq({ headers }) ?? "unknown";
        const rl = rateLimit(`login:${ip}:${email.toLowerCase()}`, { windowMs: 60_000, max: 20 });
        if (!rl.ok) return null;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          select: {
            id: true,
            email: true,
            name: true,
            username: true,
            passwordHash: true,
          },
        });
        if (!user?.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.username ?? user.email,
        };
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
};
