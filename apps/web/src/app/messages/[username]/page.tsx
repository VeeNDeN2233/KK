import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { MessageComposer, ThreadMessages, type ThreadMessage } from "./ui";

type Props = {
  params: Promise<{ username: string }>;
};

export default async function ThreadPage({ params }: Props) {
  const { username: conversationId } = await params;
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;

  if (!email) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/messages" className="hover:underline">
            ← Все диалоги
          </Link>
        </div>
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
          Нужно войти.
        </div>
      </main>
    );
  }

  const me = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!me) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/messages" className="hover:underline">
            ← Все диалоги
          </Link>
        </div>
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
          Пользователь не найден.
        </div>
      </main>
    );
  }

  const convo = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      participants: { some: { userId: me.id } },
    },
    select: {
      id: true,
      participants: {
        select: { user: { select: { username: true, email: true, name: true } } },
      },
      messages: {
        orderBy: { createdAt: "asc" },
        take: 100,
        select: {
          id: true,
          text: true,
          createdAt: true,
          fromUser: { select: { email: true, username: true, name: true } },
        },
      },
    },
  });

  if (!convo) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/messages" className="hover:underline">
            ← Все диалоги
          </Link>
        </div>
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
          Диалог не найден.
        </div>
      </main>
    );
  }

  const other =
    convo.participants
      .map((p) => p.user)
      .find((u) => u.email !== email) ?? convo.participants[0]?.user;
  const title = other?.username ? `@${other.username}` : other?.name ?? other?.email ?? "Диалог";

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/messages" className="hover:underline">
          ← Все диалоги
        </Link>
      </div>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h1>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
        <ThreadMessages messages={convo.messages as ThreadMessage[]} myEmail={email} />

        <MessageComposer conversationId={convo.id} />
      </div>
    </main>
  );
}

