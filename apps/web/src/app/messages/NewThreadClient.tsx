"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function NewThreadClient() {
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <form
      className="rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-white/5"
      onSubmit={async (e) => {
        e.preventDefault();
        const v = value.trim();
        if (!v) return;
        setBusy(true);
        setError(null);
        try {
          const res = await fetch("/api/chat/create", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ usernameOrEmail: v }),
          });
          if (!res.ok) {
            const data = (await res.json().catch(() => null)) as { error?: string } | null;
            if (res.status === 401) setError("Нужно войти.");
            else if (data?.error === "user_not_found") setError("Пользователь не найден.");
            else if (data?.error === "cannot_message_self") setError("Нельзя написать самому себе.");
            else if (data?.error === "rate_limited") setError("Слишком много попыток. Попробуйте позже.");
            else setError("Не удалось создать диалог.");
            return;
          }
          const data = (await res.json()) as { conversationId: string };
          router.push(`/messages/${data.conversationId}`);
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
        Новый диалог
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="@username или email"
          className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-black/20"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {busy ? "…" : "Создать"}
        </button>
      </div>
      {error ? (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</div>
      ) : null}
    </form>
  );
}

