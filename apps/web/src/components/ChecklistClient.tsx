"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { loadStatuses, saveStatuses, type CardStatus } from "@/lib/statusStorage";

export type ChecklistCard = {
  number: string;
  title?: string;
  series?: string;
};

type Props = {
  collectionSlug: string;
  cards: ChecklistCard[];
};

const statusKinds: { key: CardStatus; label: string }[] = [
  { key: "missing", label: "Нет" },
  { key: "owned", label: "Есть" },
  { key: "wanted", label: "Нужно" },
  { key: "forTrade", label: "На обмен" },
];

export function ChecklistClient({ collectionSlug, cards }: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CardStatus | "all">("all");
  const [statuses, setStatuses] = useState<Record<string, CardStatus>>({});

  useEffect(() => {
    setStatuses(loadStatuses(collectionSlug));
  }, [collectionSlug]);

  useEffect(() => {
    saveStatuses(collectionSlug, statuses);
  }, [collectionSlug, statuses]);

  const stats = useMemo(() => {
    let missing = 0;
    let owned = 0;
    let wanted = 0;
    let forTrade = 0;
    for (const c of cards) {
      const s = statuses[c.number] ?? "missing";
      if (s === "missing") missing += 1;
      if (s === "owned") owned += 1;
      if (s === "wanted") wanted += 1;
      if (s === "forTrade") forTrade += 1;
    }
    const total = cards.length;
    const pct = total ? Math.round((owned / total) * 100) : 0;
    return { total, missing, owned, wanted, forTrade, pct };
  }, [cards, statuses]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cards.filter((c) => {
      const s = statuses[c.number] ?? "missing";
      if (filter !== "all" && s !== filter) return false;
      if (!q) return true;
      const hay = `${c.number} ${c.title ?? ""} ${c.series ?? ""}`.toLowerCase();
      return hay.includes(q);
    });
  }, [cards, filter, query, statuses]);

  return (
    <div>
      <div className="mt-6 flex justify-end">
        <Link
          href={`/me/matches/${collectionSlug}`}
          className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Найти обмен
        </Link>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex flex-1 items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 dark:border-white/10 dark:bg-white/5">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                Поиск
              </div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="номер или название…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setFilter("all");
              }}
              className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
            >
              Сбросить
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-full border px-3 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-white/10 ${
                filter === "all"
                  ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-black"
                  : "border-zinc-200 bg-white text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200"
              }`}
            >
              Все
            </button>
            {statusKinds.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setFilter(s.key)}
                className={`rounded-full border px-3 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-white/10 ${
                  filter === s.key
                    ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-black"
                    : "border-zinc-200 bg-white text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
          <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-300">
            <div>Прогресс</div>
            <div>{stats.pct}%</div>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10">
            <div
              className="h-full rounded-full bg-zinc-900 dark:bg-white"
              style={{ width: `${stats.pct}%` }}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-600 dark:text-zinc-300">
            <span className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-white/10">
              Есть: {stats.owned}
            </span>
            <span className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-white/10">
              Нужно: {stats.wanted}
            </span>
            <span className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-white/10">
              На обмен: {stats.forTrade}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-zinc-200 bg-white dark:border-white/10 dark:bg-white/5">
        <div className="grid grid-cols-12 border-b border-zinc-200/60 px-4 py-2 text-xs font-medium text-zinc-600 dark:border-white/10 dark:text-zinc-300">
          <div className="col-span-2">№</div>
          <div className="col-span-6">Карточка</div>
          <div className="col-span-4 text-right">Статус</div>
        </div>

        <ul className="divide-y divide-zinc-200/60 dark:divide-white/10">
          {filtered.map((c) => {
            const s = statuses[c.number] ?? "missing";
            return (
              <li
                key={c.number}
                className="grid grid-cols-12 items-center gap-2 px-4 py-3"
              >
                <div className="col-span-2 font-mono text-sm text-zinc-700 dark:text-zinc-200">
                  {c.number}
                </div>
                <div className="col-span-6">
                  <div className="text-sm font-medium">{c.title ?? "—"}</div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {c.series ?? "—"}
                  </div>
                </div>
                <div className="col-span-4 flex justify-end gap-2">
                  {statusKinds.map((k) => (
                    <button
                      key={k.key}
                      type="button"
                      onClick={() =>
                        setStatuses((prev) => ({ ...prev, [c.number]: k.key }))
                      }
                      className={`rounded-md border px-2 py-1 text-xs hover:bg-zinc-100 dark:hover:bg-white/10 ${
                        s === k.key
                          ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-black"
                          : "border-zinc-200 bg-white dark:border-white/10 dark:bg-white/5"
                      }`}
                    >
                      {k.label}
                    </button>
                  ))}
                </div>
              </li>
            );
          })}
          {!filtered.length ? (
            <li className="px-4 py-8 text-sm text-zinc-600 dark:text-zinc-300">
              Ничего не найдено по текущему фильтру.
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}

