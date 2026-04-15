import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __ck_prisma: PrismaClient | undefined;
}

export const prisma =
  global.__ck_prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__ck_prisma = prisma;
}

