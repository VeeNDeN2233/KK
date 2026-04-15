"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState<string | null>(null);

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
            setError("Не удалось создать пользователя (возможно, email уже занят).");
            return;
          }

          await signIn("credentials", {
            email,
            password,
            redirect: true,
            callbackUrl: "/me",
          });
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
            Username (опционально)
          </div>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-black/20"
          />
        </label>

        <label className="mt-4 block">
          <div className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
            Город (опционально)
          </div>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="mt-2 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-black/20"
          />
        </label>

        {error ? (
          <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700 dark:border-white/10 dark:bg-black/30 dark:text-zinc-200">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          className="mt-5 w-full rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          Создать аккаунт
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

