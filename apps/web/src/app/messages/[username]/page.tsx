import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { prisma } from "@/lib/prisma";
import { MessageComposer } from "./ui";

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

  const convo = await (prisma as any).conversation.findFirst({
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
    (convo.participants as any[])
      .map((p: any) => p.user)
      .find((u: any) => u.email !== email) ?? convo.participants[0]?.user;
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
        <div className="max-h-[55vh] space-y-2 overflow-auto pr-2">
          {convo.messages.map((m) => {
            const fromMe = m.fromUser.email === email;
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
          {!convo.messages.length ? (
            <div className="text-sm text-zinc-600 dark:text-zinc-300">
              Начните диалог.
            </div>
          ) : null}
        </div>

        <MessageComposer conversationId={convo.id} />
      </div>
    </main>
  );
}

