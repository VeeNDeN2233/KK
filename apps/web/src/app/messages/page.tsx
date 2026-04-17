import Link from "next/link";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { NewThreadClient } from "./NewThreadClient";

type ConversationRow = {
  id: string;
  updatedAt: Date;
  participants: { user: { username: string | null; email: string; name: string | null } }[];
  messages: { text: string }[];
};

export default function MessagesIndexPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Сообщения</h1>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
        Чаты между участниками (серверные).
      </p>

      <div className="mt-6 grid gap-3">
        <ServerThreads />
      </div>
    </main>
  );
}

async function ServerThreads() {
  let session: Session | null = null;
  try {
    session = await getServerSession(authOptions);
  } catch {
    session = null;
  }
  const email = session?.user?.email;
  if (!email) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
        Нужно войти.
      </div>
    );
  }

  const me = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!me) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
        Пользователь не найден.
      </div>
    );
  }

  const conversations = await prisma.conversation.findMany({
    where: { participants: { some: { userId: me.id } } },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      updatedAt: true,
      participants: {
        select: { user: { select: { username: true, email: true, name: true } } },
      },
      messages: { orderBy: { createdAt: "desc" }, take: 1, select: { text: true } },
    },
  });

  return (
    <>
      <NewThreadClient />
      {!conversations.length ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
          Пока нет диалогов.
        </div>
      ) : null}
      {(conversations as ConversationRow[]).map((c) => {
        const other =
          c.participants.map((p) => p.user).find((u) => u.email !== email) ??
          c.participants[0]?.user;
        const label = other?.username ? `@${other.username}` : other?.name ?? other?.email ?? "Диалог";
        const last = c.messages[0]?.text ?? "";
        return (
          <Link
            key={c.id}
            href={`/messages/${c.id}`}
            className="rounded-2xl border border-zinc-200 bg-white p-5 hover:border-zinc-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20"
          >
            <div className="text-sm text-zinc-500 dark:text-zinc-400">{label}</div>
            <div className="mt-1 text-sm text-zinc-700 dark:text-zinc-200">
              {last ? last : "Открыть диалог →"}
            </div>
          </Link>
        );
      })}
    </>
  );
}
