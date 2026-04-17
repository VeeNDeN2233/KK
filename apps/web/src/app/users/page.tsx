"use client";

import Link from "next/link";
import { useCallback, useState } from "react";

type UserHit = {
  username: string;
  name: string | null;
  city: string | null;
  country: string | null;
};

export default function UsersSearchPage() {
  const [q, setQ] = useState("");
  const [users, setUsers] = useState<UserHit[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (query: string) => {
    const trimmed = query.trim().replace(/^@/, "");
    if (trimmed.length < 2) {
      setError("Введите минимум 2 символа.");
      setUsers(null);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(trimmed)}`, {
        credentials: "include",
      });
      if (res.status === 401) {
        setError("Нужно войти.");
        setUsers(null);
        return;
      }
      if (res.status === 429) {
        setError("Слишком много запросов. Попробуйте позже.");
        setUsers(null);
        return;
      }
      if (!res.ok) {
        setError("Не удалось выполнить поиск.");
        setUsers(null);
        return;
      }
      const data = (await res.json()) as { users: UserHit[] };
      setUsers(data.users);
    } finally {
      setBusy(false);
    }
  }, []);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/" className="hover:underline">
          ← Главная
        </Link>
      </div>

      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Люди</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
        Поиск по нику и имени (только для авторизованных).
      </p>

      <form
        className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end"
        onSubmit={(e) => {
          e.preventDefault();
          void search(q);
        }}
      >
        <div className="flex-1">
          <label htmlFor="q" className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
            Запрос
          </label>
          <input
            id="q"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="@ник или имя"
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-black/20"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {busy ? "Ищем…" : "Найти"}
        </button>
      </form>

      {error ? (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      {users && users.length === 0 ? (
        <p className="mt-6 text-sm text-zinc-600 dark:text-zinc-300">Никого не нашли.</p>
      ) : null}

      {users && users.length > 0 ? (
        <ul className="mt-6 divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white dark:divide-white/10 dark:border-white/10 dark:bg-white/5">
          {users.map((u) => (
            <li key={u.username}>
              <Link
                href={`/u/${u.username}`}
                className="block px-4 py-3 hover:bg-zinc-50 dark:hover:bg-white/5"
              >
                <div className="font-medium">@{u.username}</div>
                {u.name ? (
                  <div className="text-sm text-zinc-600 dark:text-zinc-300">{u.name}</div>
                ) : null}
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {[u.city, u.country].filter(Boolean).join(", ") || "—"}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </main>
  );
}
