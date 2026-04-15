"use client";

import { useState } from "react";

export function MessageComposer({ conversationId }: { conversationId: string }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="mt-4 flex gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        const t = text.trim();
        if (!t) return;
        setBusy(true);
        try {
          const res = await fetch(`/api/chat/${conversationId}/messages`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ text: t }),
          });
          if (res.ok) {
            setText("");
            // MVP: простое обновление страницы, без realtime.
            window.location.reload();
          }
        } finally {
          setBusy(false);
        }
      }}
    >
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Написать сообщение…"
        className="flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-black/20"
      />
      <button
        type="submit"
        disabled={busy}
        className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        Отправить
      </button>
    </form>
  );
}

