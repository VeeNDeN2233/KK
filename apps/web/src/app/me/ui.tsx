"use client";

import { useMemo, useRef, useState } from "react";

type InitialProfile = {
  username: string | null;
  name: string | null;
  city: string | null;
  country: string | null;
  avatarUrl: string | null;
  tradeByMail: boolean;
  tradeInPerson: boolean;
};

export function ProfileFormClient({ initial }: { initial: InitialProfile }) {
  const [username, setUsername] = useState(initial.username ?? "");
  const [name, setName] = useState(initial.name ?? "");
  const [city, setCity] = useState(initial.city ?? "");
  const [country, setCountry] = useState(initial.country ?? "");
  const [avatarUrl, setAvatarUrl] = useState(initial.avatarUrl ?? "");
  const [tradeByMail, setTradeByMail] = useState(initial.tradeByMail);
  const [tradeInPerson, setTradeInPerson] = useState(initial.tradeInPerson);
  const [busy, setBusy] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const avatarPreview = useMemo(() => avatarUrl || null, [avatarUrl]);

  return (
    <form
      className="grid gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        setSaved(false);
        try {
          const res = await fetch("/api/me/profile", {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              username: username.trim() ? username.trim() : null,
              name: name.trim() ? name.trim() : null,
              city: city.trim() ? city.trim() : null,
              country: country.trim() ? country.trim() : null,
              tradeByMail,
              tradeInPerson,
            }),
          });

          if (!res.ok) {
            const data = (await res.json().catch(() => null)) as { error?: string } | null;
            if (res.status === 401) setError("Нужно войти.");
            else if (res.status === 429) setError("Слишком много попыток. Попробуйте позже.");
            else if (data?.error === "username_taken") setError("Этот username уже занят.");
            else setError("Не удалось сохранить профиль.");
            return;
          }
          setSaved(true);
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <div className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Имя</div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-black/20"
            placeholder="Как вас зовут"
          />
        </label>
        <label className="block">
          <div className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Username</div>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-black/20"
            placeholder="@username"
          />
        </label>
        <label className="block">
          <div className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Город</div>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-black/20"
            placeholder="Москва"
          />
        </label>
        <label className="block">
          <div className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Страна</div>
          <input
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-black/20"
            placeholder="Россия"
          />
        </label>
      </div>

      <div className="grid gap-2">
        <div className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Аватар</div>
        <div className="flex items-center gap-3">
          {avatarPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarPreview}
              alt=""
              className="h-10 w-10 rounded-xl border border-zinc-200 object-cover dark:border-white/10"
            />
          ) : (
            <div className="h-10 w-10 rounded-xl border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-black/30" />
          )}

          <input
            ref={avatarInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0] ?? null;
              if (!f) return;
              setAvatarBusy(true);
              setError(null);
              try {
                const fd = new FormData();
                fd.set("file", f);
                const res = await fetch("/api/me/avatar", {
                  method: "POST",
                  body: fd,
                  credentials: "include",
                });
                if (!res.ok) {
                  const data = (await res.json().catch(() => null)) as { error?: string } | null;
                  if (res.status === 401) setError("Нужно войти.");
                  else if (res.status === 413) setError("Файл слишком большой (до 5MB).");
                  else if (data?.error === "unsupported_type") setError("Нужен JPG/PNG/WebP.");
                  else if (res.status === 429) setError("Слишком много попыток. Попробуйте позже.");
                  else setError("Не удалось загрузить аватар.");
                  return;
                }
                const data = (await res.json()) as { avatarUrl: string };
                setAvatarUrl(data.avatarUrl);
              } finally {
                setAvatarBusy(false);
                if (e.target) e.target.value = "";
              }
            }}
          />

          <button
            type="button"
            disabled={avatarBusy}
            onClick={() => avatarInputRef.current?.click()}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
          >
            {avatarBusy ? "Загружаем…" : "Загрузить фото"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
          <input
            type="checkbox"
            checked={tradeByMail}
            onChange={(e) => setTradeByMail(e.target.checked)}
          />
          Обмен по почте
        </label>
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
          <input
            type="checkbox"
            checked={tradeInPerson}
            onChange={(e) => setTradeInPerson(e.target.checked)}
          />
          Обмен лично
        </label>
      </div>

      {error ? (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-700 dark:border-white/10 dark:bg-black/30 dark:text-zinc-200">
          {error}
        </div>
      ) : null}
      {saved ? (
        <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-900 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-200">
          Сохранено.
        </div>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        {busy ? "Сохраняем…" : "Сохранить"}
      </button>
    </form>
  );
}

