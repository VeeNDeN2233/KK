"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSession } from "next-auth/react";
import { loadCollections } from "@/lib/collectionsStorage";
import { mockCollections } from "@/lib/mock";

export default function CollectionsPage() {
  const collections = useMemo(() => loadCollections() ?? mockCollections, []);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getSession().then((s) => {
      if (cancelled) return;
      setIsAuthed(!!s?.user?.email);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Коллекции</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Каталог коллекций. Можно загрузить свои данные через импорт CSV.
          </p>
        </div>
        {isAuthed ? (
          <Link
            href="/me"
            className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Мои коллекции
          </Link>
        ) : (
          <Link
            href="/auth/login"
            className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Войти
          </Link>
        )}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {collections.map((c) => (
          <Link
            key={c.slug}
            href={isAuthed ? `/me/collections/${c.slug}` : "/auth/login"}
            className="group rounded-2xl border border-zinc-200 bg-white p-5 hover:border-zinc-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20"
          >
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              {c.type}
              {c.year ? ` · ${c.year}` : ""}
              {` · ${c.totalItems} шт.`}
            </div>
            <div className="mt-1 text-lg font-semibold tracking-tight">
              {c.title}
            </div>
            <div className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">
              {isAuthed ? "Открыть чек‑лист в «Мои коллекции»" : "Войти, чтобы открыть чек‑лист"}
              <span className="ml-1 inline-block transition-transform group-hover:translate-x-0.5">
                →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

