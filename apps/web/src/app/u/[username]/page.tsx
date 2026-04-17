import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { WriteButton } from "./WriteButton";

type Props = {
  params: Promise<{ username: string }>;
};

function normalizeHandle(raw: string) {
  return raw.trim().replace(/^@/, "");
}

export default async function PublicProfilePage({ params }: Props) {
  const { username: raw } = await params;
  const handle = normalizeHandle(raw);
  if (!handle) notFound();

  const user = await prisma.user.findUnique({
    where: { username: handle },
    select: {
      username: true,
      name: true,
      avatarUrl: true,
      city: true,
      country: true,
      tradeByMail: true,
      tradeInPerson: true,
    },
  });

  if (!user?.username) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="text-sm text-zinc-500 dark:text-zinc-400">
        <Link href="/users" className="hover:underline">
          ← Поиск людей
        </Link>
      </div>

      <div className="mt-4 flex items-center gap-4">
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt=""
            className="h-14 w-14 rounded-2xl border border-zinc-200 object-cover dark:border-white/10"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-sm font-semibold text-white dark:bg-white dark:text-black">
            {(user.name?.[0] ?? user.username[0] ?? "U").toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">@{user.username}</h1>
          {user.name ? (
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{user.name}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-5 text-sm text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200">
        <div className="font-medium text-zinc-900 dark:text-white">Локация</div>
        <div className="mt-1">
          {[user.city, user.country].filter(Boolean).join(", ") || "—"}
        </div>
        <div className="mt-4 font-medium text-zinc-900 dark:text-white">Обмен</div>
        <ul className="mt-1 list-disc pl-5">
          <li>По почте: {user.tradeByMail ? "да" : "нет"}</li>
          <li>Лично: {user.tradeInPerson ? "да" : "нет"}</li>
        </ul>
      </div>

      <div className="mt-6">
        <WriteButton username={user.username} />
      </div>
    </main>
  );
}
