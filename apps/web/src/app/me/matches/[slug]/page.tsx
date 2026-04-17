"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { loadStatuses } from "@/lib/statusStorage";
import { mockCandidates } from "@/lib/mockUsers";

function intersect(a: string[], b: string[]) {
  const bs = new Set(b);
  return a.filter((x) => bs.has(x));
}

type MatchRow = {
  userId: string;
  username: string;
  score: number;
  why: string[];
  youGet: string[];
  theyGet: string[];
};

export default function MatchesPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";
  const [yourCity, setYourCity] = useState("Москва");
  const [okByMail, setOkByMail] = useState(true);

  const { wanted, forTrade } = useMemo(() => {
    const statuses = loadStatuses(slug);
    const wanted: string[] = [];
    const forTrade: string[] = [];
    for (const [number, status] of Object.entries(statuses)) {
      if (status === "wanted") wanted.push(number);
      if (status === "forTrade") forTrade.push(number);
    }
    return { wanted, forTrade };
  }, [slug]);

  const matches = useMemo(() => {
    const rows: MatchRow[] = [];
    for (const u of mockCandidates) {
      const inv = u.inventory[slug];
      if (!inv) continue;

      const youGet = intersect(wanted, inv.forTrade);
      const theyGet = intersect(forTrade, inv.wanted);
      if (youGet.length === 0 && theyGet.length === 0) continue;

      const why: string[] = [];
      let score = 0;

      if (youGet.length) {
        score += youGet.length * 10;
        why.push(`У него есть нужные вам: ${youGet.length}`);
      }
      if (theyGet.length) {
        score += theyGet.length * 8;
        why.push(`Ему нужно из ваших «на обмен»: ${theyGet.length}`);
      }

      if (u.city && u.city === yourCity) {
        score += 6;
        why.push("Один город");
      }
      if (okByMail && u.tradeByMail) {
        score += 2;
        why.push("Обмен по почте возможен");
      }

      rows.push({
        userId: u.id,
        username: u.username,
        score,
        why,
        youGet,
        theyGet,
      });
    }
    rows.sort((a, b) => b.score - a.score);
    return rows;
  }, [forTrade, okByMail, slug, wanted, yourCity]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="text-sm text-zinc-500 dark:text-zinc-400">
        <Link href={`/me/collections/${slug}`} className="hover:underline">
          ← Назад к чек‑листу
        </Link>
      </div>

      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Найти обмен</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
        MVP-подбор: скоринг по совпадениям «нужно ↔ на обмен» + город/почта
        (демо пользователи).
      </p>

      <div className="mt-6 grid gap-3 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-white/5 sm:grid-cols-3">
        <div>
          <div className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
            Ваш город
          </div>
          <input
            value={yourCity}
            onChange={(e) => setYourCity(e.target.value)}
            className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-black/20"
          />
        </div>
        <label className="flex items-center gap-2 pt-6 text-sm text-zinc-700 dark:text-zinc-200">
          <input
            type="checkbox"
            checked={okByMail}
            onChange={(e) => setOkByMail(e.target.checked)}
          />
          Обмен по почте ок
        </label>
        <div className="pt-6 text-sm text-zinc-600 dark:text-zinc-300">
          Вы хотите: <b>{wanted.length}</b> · На обмен: <b>{forTrade.length}</b>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {matches.map((m) => (
          <div
            key={m.userId}
            className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-white/5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  @{m.username}
                </div>
                <div className="mt-1 text-lg font-semibold tracking-tight">
                  Скор: {m.score}
                </div>
                <ul className="mt-2 list-disc pl-5 text-sm text-zinc-600 dark:text-zinc-300">
                  {m.why.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl bg-zinc-50 px-3 py-2 text-sm text-zinc-700 dark:bg-black/30 dark:text-zinc-200">
                <Link
                  href={`/u/${m.username}`}
                  className="font-medium hover:underline"
                >
                  Контакт
                </Link>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-zinc-200/60 bg-zinc-50 p-4 text-sm dark:border-white/10 dark:bg-black/30">
                <div className="font-medium">Вы получите</div>
                <div className="mt-2 text-zinc-700 dark:text-zinc-200">
                  {m.youGet.length ? m.youGet.join(", ") : "—"}
                </div>
              </div>
              <div className="rounded-xl border border-zinc-200/60 bg-zinc-50 p-4 text-sm dark:border-white/10 dark:bg-black/30">
                <div className="font-medium">Он получит</div>
                <div className="mt-2 text-zinc-700 dark:text-zinc-200">
                  {m.theyGet.length ? m.theyGet.join(", ") : "—"}
                </div>
              </div>
            </div>
          </div>
        ))}
        {!matches.length ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
            Пока нет кандидатов. Отметьте в чек‑листе «Нужно» и/или «На обмен».
          </div>
        ) : null}
      </div>
    </main>
  );
}

