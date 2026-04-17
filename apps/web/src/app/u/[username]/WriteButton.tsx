"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function WriteButton({ username }: { username: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div>
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          setError(null);
          try {
            const res = await fetch("/api/chat/create", {
              method: "POST",
              headers: { "content-type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ usernameOrEmail: `@${username}` }),
            });
            if (!res.ok) {
              const data = (await res.json().catch(() => null)) as { error?: string } | null;
              if (res.status === 401) setError("Нужно войти.");
              else if (data?.error === "rate_limited") setError("Слишком много попыток. Попробуйте позже.");
              else if (data?.error === "cannot_message_self") setError("Нельзя написать самому себе.");
              else setError("Не удалось открыть диалог.");
              return;
            }
            const data = (await res.json()) as { conversationId: string };
            router.push(`/messages/${data.conversationId}`);
          } finally {
            setBusy(false);
          }
        }}
        className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        {busy ? "Открываем…" : "Написать"}
      </button>
      {error ? (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
