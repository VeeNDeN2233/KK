"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

type CityItem = { label: string };

export function RegisterClient() {
  const search = useSearchParams();
  const next = search?.get("next") ?? "/me";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [username, setUsername] = useState("");
  const [city, setCity] = useState("");
  const [cityOpen, setCityOpen] = useState(false);
  const [cityBusy, setCityBusy] = useState(false);
  const [cityItems, setCityItems] = useState<CityItem[]>([]);
  const [cityHint, setCityHint] = useState<string | null>(null);
  const cityReqId = useRef(0);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const cityQuery = useMemo(() => city.trim(), [city]);

  useEffect(() => {
    const q = cityQuery;
    if (q.length < 2) {
      setCityItems([]);
      setCityHint(null);
      setCityOpen(false);
      return;
    }

    const t = setTimeout(async () => {
      const id = ++cityReqId.current;
      setCityBusy(true);
      setCityHint(null);
      setCityOpen(true);
      try {
        const res = await fetch(`/api/geo/suggest?q=${encodeURIComponent(q)}`);
        if (!res.ok) {
          if (id !== cityReqId.current) return;
          setCityItems([]);
          if (res.status === 429) setCityHint("Слишком много запросов. Попробуйте позже.");
          else setCityHint("Не удалось получить подсказки.");
          return;
        }
        const data = (await res.json()) as { items: CityItem[] };
        if (id !== cityReqId.current) return;
        const items = Array.isArray(data.items) ? data.items : [];
        setCityItems(items);
        setCityHint(items.length ? null : "Ничего не нашли. Попробуйте уточнить запрос.");
      } finally {
        if (id === cityReqId.current) setCityBusy(false);
      }
    }, 250);

    return () => clearTimeout(t);
  }, [cityQuery]);

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Регистрация</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
        Создайте аккаунт CK, чтобы отмечать карты и находить обмены.
      </p>

      <form
        className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-white/5"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);

          if (password.length < 6) {
            setError("Пароль должен быть минимум 6 символов.");
            return;
          }
          if (password !== password2) {
            setError("Пароли не совпадают.");
            return;
          }

          setSubmitting(true);

          try {
            const res = await fetch("/api/auth/register", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                email,
                password,
                username: username.trim() || undefined,
                city: city.trim() || undefined,
              }),
            });

            if (!res.ok) {
              const data = (await res.json().catch(() => null)) as
                | { error?: string; issues?: unknown }
                | null;
              if (data?.error === "rate_limited") {
                setError("Слишком много попыток. Попробуйте чуть позже.");
              } else if (data?.error === "email_taken") {
                setError("Этот email уже занят.");
              } else if (data?.error === "username_taken") {
                setError("Этот username уже занят.");
              } else if (data?.error === "db_unavailable") {
                setError(
                  "Сервер не может подключиться к базе. Если вы локально — запустите БД (npm run db:up) и миграции (npm run db:migrate).",
                );
              } else if (data?.error === "invalid_payload") {
                setError("Проверьте поля формы (email/пароль/username).");
              } else if (data?.error === "conflict") {
                setError("Конфликт данных. Попробуйте другой email или username.");
              } else if (data?.error === "internal_error") {
                setError("Серверная ошибка. Попробуйте ещё раз чуть позже.");
              } else {
                setError("Не удалось создать пользователя. Попробуйте ещё раз.");
              }
              return;
            }

            await signIn("credentials", {
              email,
              password,
              redirect: true,
              callbackUrl: next,
            });
          } finally {
            setSubmitting(false);
          }
        }}
      >
        <label className="block">
          <div className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
            Email
          </div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-black/20"
            type="email"
            required
          />
        </label>

        <label className="mt-4 block">
          <div className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
            Пароль (минимум 6 символов)
          </div>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-black/20"
            type="password"
            minLength={6}
            required
          />
        </label>

        <label className="mt-4 block">
          <div className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
            Повторите пароль
          </div>
          <input
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-black/20"
            type="password"
            minLength={6}
            required
          />
        </label>

        <label className="mt-4 block">
          <div className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
            Username (опционально)
          </div>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-black/20"
            placeholder="@username"
          />
        </label>

        <label className="mt-4 block">
          <div className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
            Город (опционально)
          </div>
          <div className="relative">
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              onFocus={() => {
                if (cityQuery.length >= 2) setCityOpen(true);
              }}
              onBlur={() => {
                // Give click handler time to run
                setTimeout(() => setCityOpen(false), 120);
              }}
              className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-black/20"
              placeholder="Начните вводить (например, Москва)"
              autoComplete="off"
            />

            {cityBusy ? (
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
                …
              </div>
            ) : null}

            {cityOpen && cityItems.length ? (
              <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-black">
                {cityItems.map((i) => (
                  <button
                    key={i.label}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setCity(i.label);
                      setCityOpen(false);
                    }}
                    className="block w-full px-3 py-2 text-left text-sm text-zinc-800 hover:bg-zinc-50 dark:text-zinc-100 dark:hover:bg-white/5"
                  >
                    {i.label}
                  </button>
                ))}
              </div>
            ) : null}

            {cityOpen && !cityItems.length && cityQuery.length >= 2 ? (
              <div className="absolute z-10 mt-2 w-full rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-600 shadow-sm dark:border-white/10 dark:bg-black dark:text-zinc-300">
                {cityHint ?? "Ищем…"}
              </div>
            ) : null}
          </div>
        </label>

        {error ? (
          <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700 dark:border-white/10 dark:bg-black/30 dark:text-zinc-200">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="mt-5 w-full rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {submitting ? "Создаём…" : "Создать аккаунт"}
        </button>

        <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
          Уже есть аккаунт?{" "}
          <Link href="/auth/login" className="font-medium hover:underline">
            Войти
          </Link>
        </div>
      </form>
    </main>
  );
}

