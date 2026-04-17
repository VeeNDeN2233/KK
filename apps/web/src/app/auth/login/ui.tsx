"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export function LoginClient() {
  const search = useSearchParams();
  const next = search?.get("next") ?? "/me";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  return (
    <main className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Вход</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
        Войдите в CK (Card Kartel), чтобы вести коллекции и общаться.
      </p>

      <form
        className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-white/5"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          setSubmitting(true);
          try {
            const res = await signIn("credentials", {
              email,
              password,
              redirect: true,
              callbackUrl: next,
            });
            if (res?.error) setError("Неверный email или пароль");
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
            Пароль
          </div>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-black/20"
            type="password"
            required
          />
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
          {submitting ? "Входим…" : "Войти"}
        </button>

        <div className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
          Нет аккаунта?{" "}
          <Link href="/auth/register" className="font-medium hover:underline">
            Регистрация
          </Link>
        </div>
      </form>
    </main>
  );
}

