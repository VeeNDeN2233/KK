"use client";

import { useMemo, useState } from "react";
import { parseCsv, toCsv } from "@/lib/csv";
import { loadStatuses, saveStatuses, type CardStatus } from "@/lib/statusStorage";
import { saveCards, saveCollections } from "@/lib/collectionsStorage";
import type { MockCardItem, MockCollection } from "@/lib/mock";

type StatusRow = {
  collectionSlug: string;
  number: string;
  status: CardStatus;
};

function normalizeStatus(input: string): CardStatus | null {
  const v = input.trim().toLowerCase();
  if (v === "missing" || v === "нет") return "missing";
  if (v === "owned" || v === "есть") return "owned";
  if (v === "wanted" || v === "нужно") return "wanted";
  if (v === "fortrade" || v === "trade" || v === "на обмен") return "forTrade";
  return null;
}

export default function ImportExportPage() {
  const [slug, setSlug] = useState("panini_world_cup_2026_adrenalyn_xl");
  const [message, setMessage] = useState<string | null>(null);

  const currentCount = useMemo(() => {
    const s = loadStatuses(slug);
    return Object.keys(s).length;
  }, [slug]);

  async function onImportStatuses(file: File) {
    setMessage(null);
    const text = await file.text();
    const rows = parseCsv(text);

    const parsed: StatusRow[] = [];
    for (const r of rows) {
      const collectionSlug = (r.collectionSlug ?? r.slug ?? "").trim();
      const number = (r.number ?? r.no ?? r.id ?? "").trim();
      const st = normalizeStatus(r.status ?? r.state ?? "");
      if (!collectionSlug || !number || !st) continue;
      parsed.push({ collectionSlug, number, status: st });
    }

    const grouped = new Map<string, Record<string, CardStatus>>();
    for (const p of parsed) {
      const existing = grouped.get(p.collectionSlug) ?? loadStatuses(p.collectionSlug);
      existing[p.number] = p.status;
      grouped.set(p.collectionSlug, existing);
    }

    for (const [k, v] of grouped.entries()) {
      saveStatuses(k, v);
    }
    setMessage(
      `Импортировано строк: ${parsed.length}. Обновлено коллекций: ${grouped.size}.`,
    );
  }

  async function onImportCollections(file: File) {
    setMessage(null);
    const text = await file.text();
    const rows = parseCsv(text);
    const collections: MockCollection[] = [];
    for (const r of rows) {
      const slug = (r.slug ?? r.collectionSlug ?? "").trim();
      const title = (r.title ?? "").trim();
      const type = (r.type ?? "TCG").trim();
      const yearRaw = (r.year ?? "").trim();
      const totalRaw = (r.totalItems ?? r.total ?? r.count ?? "").trim();
      if (!slug || !title) continue;
      const year = yearRaw ? Number(yearRaw) : undefined;
      const totalItems = totalRaw ? Number(totalRaw) : 0;
      collections.push({
        slug,
        title,
        type,
        year: Number.isFinite(year) ? year : undefined,
        totalItems: Number.isFinite(totalItems) ? totalItems : 0,
      });
    }
    saveCollections(collections);
    setMessage(`Импортировано коллекций: ${collections.length}.`);
  }

  async function onImportCards(file: File) {
    setMessage(null);
    const text = await file.text();
    const rows = parseCsv(text);

    const grouped = new Map<string, MockCardItem[]>();
    for (const r of rows) {
      const collectionSlug = (r.collectionSlug ?? r.slug ?? "").trim();
      const number = (r.number ?? r.no ?? "").trim();
      const title = (r.title ?? "").trim();
      const series = (r.series ?? "").trim();
      if (!collectionSlug || !number) continue;
      const arr = grouped.get(collectionSlug) ?? [];
      arr.push({ number, title: title || undefined, series: series || undefined });
      grouped.set(collectionSlug, arr);
    }

    for (const [collectionSlug, cards] of grouped.entries()) {
      saveCards(collectionSlug, cards);
    }
    setMessage(`Импортировано карточек: ${rows.length}. Коллекций: ${grouped.size}.`);
  }

  function downloadCurrent() {
    const statuses = loadStatuses(slug);
    const headers = ["collectionSlug", "number", "status"];
    const rows = Object.entries(statuses).map(([number, status]) => ({
      collectionSlug: slug,
      number,
      status,
    }));
    const csv = toCsv(headers, rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ck-statuses-${slug}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Импорт / экспорт</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
        MVP: данные и статусы сохраняются в браузере. Здесь можно выгрузить и
        загрузить CSV.
      </p>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
        <div className="text-sm font-medium">Импорт данных коллекций</div>
        <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          Формат <code>collections.csv</code>: <code>slug,title,type,year,totalItems</code>
          <br />
          Формат <code>cards.csv</code>: <code>collectionSlug,number,title,series</code>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="rounded-xl border border-zinc-200 bg-white p-3 text-sm dark:border-white/10 dark:bg-black/20">
            <div className="font-medium">collections.csv</div>
            <input
              className="mt-2"
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onImportCollections(f);
              }}
            />
          </label>
          <label className="rounded-xl border border-zinc-200 bg-white p-3 text-sm dark:border-white/10 dark:bg-black/20">
            <div className="font-medium">cards.csv</div>
            <input
              className="mt-2"
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onImportCards(f);
              }}
            />
          </label>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
        <div className="text-sm font-medium">Экспорт статусов</div>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-black/20"
            placeholder="collection slug…"
          />
          <button
            type="button"
            onClick={downloadCurrent}
            className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Скачать CSV ({currentCount})
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
        <div className="text-sm font-medium">Импорт статусов чек‑листа</div>
        <div className="mt-3">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onImportStatuses(f);
            }}
          />
        </div>
        {message ? (
          <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700 dark:border-white/10 dark:bg-black/30 dark:text-zinc-200">
            {message}
          </div>
        ) : null}
      </div>
    </main>
  );
}

