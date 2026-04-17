"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSession, signOut } from "next-auth/react";

const publicNav = [
  { href: "/", label: "Главная" },
  { href: "/collections", label: "Коллекции" },
] as const;

const authedNav = [
  { href: "/me", label: "Я" },
  { href: "/users", label: "Люди" },
  { href: "/messages", label: "Сообщения" },
] as const;

export function Nav() {
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void getSession()
      .then((s) => {
        if (cancelled) return;
        setIsAuthed(!!s?.user?.email);
      })
      .catch(() => {
        if (cancelled) return;
        setIsAuthed(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const nav = useMemo(
    () =>
      isAuthed
        ? [...publicNav, ...authedNav]
        : [...publicNav, { href: "/auth/login", label: "Вход" } as const],
    [isAuthed],
  );
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/60 bg-white/80 backdrop-blur dark:border-white/10 dark:bg-black/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-semibold tracking-tight">
          CK<span className="text-zinc-500 dark:text-zinc-400">/</span>
          <span className="text-zinc-700 dark:text-zinc-300">Card Kartel</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          {nav.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className="rounded-md px-2 py-1 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-white/10"
            >
              {i.label}
            </Link>
          ))}
          {isAuthed ? (
            <button
              type="button"
              onClick={async () => {
                await signOut({ redirect: true, callbackUrl: "/" });
              }}
              className="rounded-md px-2 py-1 text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-white/10"
            >
              Выйти
            </button>
          ) : null}
        </nav>
      </div>
    </header>
  );
}

