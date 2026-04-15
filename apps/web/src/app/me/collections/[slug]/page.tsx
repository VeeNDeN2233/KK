"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams } from "next/navigation";
import { ChecklistClient } from "@/components/ChecklistClient";
import { loadCards, loadCollections } from "@/lib/collectionsStorage";
import { mockCardsByCollection, mockCollections } from "@/lib/mock";

export default function MyCollectionChecklistPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";

  const collections = useMemo(() => loadCollections() ?? mockCollections, []);
  const collection = collections.find((c) => c.slug === slug);

  const cards = useMemo(() => {
    return loadCards(slug) ?? mockCardsByCollection[slug] ?? [];
  }, [slug]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      {!collection ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            Коллекция не найдена
          </div>
          <div className="mt-3">
            <Link
              href="/collections"
              className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              Вернуться в каталог
            </Link>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            <Link href="/me" className="hover:underline">
              Мои коллекции
            </Link>
            <span className="mx-2">/</span>
            <span>Чек‑лист</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            {collection?.title ?? "—"}
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            Чек‑лист: отметки «есть/нет/нужно/на обмен», фильтры и поиск.
          </p>
        </div>
      </div>

      {collection ? <ChecklistClient collectionSlug={slug} cards={cards} /> : null}
    </main>
  );
}

