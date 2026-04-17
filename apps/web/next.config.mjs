import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // npm workspaces hoist `next` to the repo root; Turbopack must share that root
  // or it cannot resolve `next/package.json` (see Next.js turbopack.root docs).
  turbopack: {
    root: path.join(__dirname, "..", ".."),
  },
};

export default nextConfig;
