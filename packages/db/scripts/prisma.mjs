import { spawnSync } from "node:child_process";

process.env.DATABASE_URL =
  process.env.CK_DATABASE_URL ??
  "postgresql://ck:ck@127.0.0.1:5433/ck?schema=public";

const result = spawnSync(
  "npx",
  ["prisma", ...process.argv.slice(2)],
  { stdio: "inherit", shell: true, env: process.env }
);

process.exit(result.status ?? 1);

