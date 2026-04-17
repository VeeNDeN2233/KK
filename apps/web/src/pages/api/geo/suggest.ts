import type { NextApiRequest, NextApiResponse } from "next";
import { getClientIpFromReq, rateLimit } from "@/lib/rateLimit";

type SuggestItem = {
  label: string;
};

type NominatimResult = {
  display_name?: unknown;
  address?: unknown;
};

type NominatimAddress = {
  state?: unknown;
  region?: unknown;
};

function pickBestLabel(i: NominatimResult): string | null {
  const display = typeof i.display_name === "string" ? i.display_name : null;
  if (!display) return null;
  const first = display.split(",")[0]?.trim();
  if (!first) return null;

  const addr: NominatimAddress =
    i.address && typeof i.address === "object" ? (i.address as NominatimAddress) : {};
  const state =
    typeof addr?.state === "string"
      ? addr.state
      : typeof addr?.region === "string"
        ? addr.region
        : null;

  // Common Russian formats:
  // "Москва" / "Химки" + "Московская область"
  if (state && first !== state) return `${first}, ${state}`;
  return first;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end();

  const ip = getClientIpFromReq(req) ?? "unknown";
  const rl = rateLimit(`geo_suggest:${ip}`, { windowMs: 60_000, max: 60 });
  if (!rl.ok) return res.status(429).json({ error: "rate_limited" });

  const raw = typeof req.query.q === "string" ? req.query.q : "";
  const q = raw.trim();
  if (q.length < 2) return res.status(400).json({ error: "query_too_short" });

  // Nominatim usage policy wants a valid User-Agent; we also set Accept-Language to RU.
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("q", q);
  url.searchParams.set("countrycodes", "ru");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("dedupe", "1");
  url.searchParams.set("limit", "8");

  const r = await fetch(url.toString(), {
    headers: {
      "accept-language": "ru-RU,ru;q=0.9",
      "user-agent": "ck-web/0.1 (city-suggest)",
    },
  });

  if (!r.ok) return res.status(502).json({ error: "upstream_error" });

  const json = (await r.json().catch(() => null)) as unknown;
  if (!Array.isArray(json)) return res.status(502).json({ error: "upstream_invalid" });

  const items: SuggestItem[] = [];
  for (const i of json as NominatimResult[]) {
    const label = pickBestLabel(i ?? {});
    if (!label) continue;
    items.push({ label });
  }

  // de-dup
  const seen = new Set<string>();
  const uniq = items.filter((x) => (seen.has(x.label) ? false : (seen.add(x.label), true)));
  return res.status(200).json({ items: uniq });
}

