import { PrismaClient } from "@prisma/client";

declare global {
  var __ck_prisma: PrismaClient | undefined;
}

if (!process.env.DATABASE_URL) {
  const isNextBuildPhase = process.env.NEXT_PHASE === "phase-production-build";
  if (process.env.NODE_ENV === "production" && !isNextBuildPhase) {
    throw new Error("DATABASE_URL is required in production runtime.");
  }
  // Dev default that matches `docker-compose.yml` (also keeps `next build` working
  // when `.env.local` is not present on a fresh checkout).
  process.env.DATABASE_URL = "postgresql://ck:ck@127.0.0.1:5433/ck?schema=public";
}

export const prisma =
  global.__ck_prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__ck_prisma = prisma;
}

