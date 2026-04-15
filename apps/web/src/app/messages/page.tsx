import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";

export default function MessagesIndexPage() {
  // Server-rendered list of conversations for the current user.
  // If DB isn't migrated yet, this page will show an empty state.
  const _ = 0;
  void _;

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
  const session = await getServerSession(authOptions);
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

  const conversations = await (prisma as any).conversation.findMany({
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

  if (!conversations.length) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
        Пока нет диалогов.
      </div>
    );
  }

  return (
    <>
      {conversations.map((c) => {
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
