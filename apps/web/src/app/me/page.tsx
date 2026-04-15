import Link from "next/link";
import { mockCollections } from "@/lib/mock";

export default function MyDashboardPage() {
  const rows = mockCollections.map((c) => ({
    ...c,
    owned: Math.floor(c.totalItems * 0.42),
    wanted: Math.floor(c.totalItems * 0.12),
    forTrade: Math.floor(c.totalItems * 0.05),
  }));

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Мои коллекции</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Отмечайте карточки и следите за прогрессом.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/me/import"
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
          >
            Импорт / экспорт CSV
          </Link>
          <Link
            href="/collections"
            className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Каталог
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        {rows.map((c) => {
          const pct = Math.round((c.owned / c.totalItems) * 100);
          return (
            <Link
              key={c.slug}
              href={`/me/collections/${c.slug}`}
              className="rounded-2xl border border-zinc-200 bg-white p-5 hover:border-zinc-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    {c.type}
                    {c.year ? ` · ${c.year}` : ""} · {c.totalItems} шт.
                  </div>
                  <div className="mt-1 text-lg font-semibold tracking-tight">
                    {c.title}
                  </div>
                </div>

                <div className="min-w-[220px]">
                  <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-300">
                    <div>Прогресс</div>
                    <div>{pct}%</div>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10">
                    <div
                      className="h-full rounded-full bg-zinc-900 dark:bg-white"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                    <span className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-white/10">
                      Есть: {c.owned}
                    </span>
                    <span className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-white/10">
                      Нужно: {c.wanted}
                    </span>
                    <span className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-white/10">
                      На обмен: {c.forTrade}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}

