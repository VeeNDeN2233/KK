"use client";

import { useEffect, useRef, useState } from "react";

export type ThreadMessage = {
  id: string;
  text: string;
  createdAt: string | Date;
  fromUser: { email: string; username: string | null; name: string | null };
};

export function ThreadMessages({
  messages,
  myEmail,
}: {
  messages: ThreadMessage[];
  myEmail: string;
}) {
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  return (
    <div ref={boxRef} className="max-h-[55vh] space-y-2 overflow-auto pr-2">
      {messages.map((m) => {
        const fromMe = m.fromUser.email === myEmail;
        return (
          <div
            key={m.id}
            className={`flex ${fromMe ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                fromMe
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-black"
                  : "bg-zinc-100 text-zinc-900 dark:bg-black/30 dark:text-zinc-100"
              }`}
            >
              {m.text}
            </div>
          </div>
        );
      })}
      {!messages.length ? (
        <div className="text-sm text-zinc-600 dark:text-zinc-300">
          Начните диалог.
        </div>
      ) : null}
    </div>
  );
}

export function MessageComposer({ conversationId }: { conversationId: string }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <form
      className="mt-4 flex flex-col gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        const t = text.trim();
        if (!t) return;
        setBusy(true);
        setError(null);
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
          } else {
            setError("Не удалось отправить сообщение.");
          }
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="flex gap-2">
        <input
          ref={inputRef}
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
      </div>
      {error ? (
        <div className="text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </div>
      ) : null}
    </form>
  );
}

