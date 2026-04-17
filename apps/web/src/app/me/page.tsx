import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { ProfileFormClient } from "./ui";

export default function MyDashboardPage() {
  return <MyDashboardServer />;
}

async function MyDashboardServer() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
          Нужно войти.
        </div>
      </main>
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      city: true,
      country: true,
      avatarUrl: true,
      tradeByMail: true,
      tradeInPerson: true,
    },
  });
  if (!user) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
          Пользователь не найден.
        </div>
      </main>
    );
  }

  const displayName = user.name ?? (user.username ? `@${user.username}` : user.email);
  const location = [user.city, user.country].filter(Boolean).join(", ");
  const initials = (displayName || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase())
    .join("");

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Личный кабинет</h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
            О себе, коллекции и прогресс.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/me/import"
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
          >
            Импорт / экспорт CSV
          </Link>
          <Link
            href="/collections"
            className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            Каталог
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-3">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-white/5 lg:col-span-1">
          <div className="flex items-center gap-4">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt=""
                className="h-12 w-12 rounded-2xl border border-zinc-200 object-cover dark:border-white/10"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 text-sm font-semibold text-white dark:bg-white dark:text-black">
                {initials || "U"}
              </div>
            )}
            <div>
              <div className="font-semibold tracking-tight">{displayName}</div>
              <div className="text-sm text-zinc-600 dark:text-zinc-300">{location || "Город не указан"}</div>
            </div>
          </div>

          <div className="mt-4 grid gap-2 text-sm text-zinc-700 dark:text-zinc-200">
            <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 dark:bg-black/30">
              <span>Обмен по почте</span>
              <b>{user.tradeByMail ? "да" : "нет"}</b>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-zinc-50 px-3 py-2 dark:bg-black/30">
              <span>Обмен лично</span>
              <b>{user.tradeInPerson ? "да" : "нет"}</b>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-sm font-semibold text-zinc-900 dark:text-white">О себе</div>
            <div className="mt-3">
              <ProfileFormClient
                initial={{
                  username: user.username,
                  name: user.name,
                  city: user.city,
                  country: user.country,
                  avatarUrl: user.avatarUrl,
                  tradeByMail: user.tradeByMail,
                  tradeInPerson: user.tradeInPerson,
                }}
              />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-white/10 dark:bg-white/5 lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-white">Собираемые коллекции</div>
              <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                Статистика берётся из базы (ваши отметки по карточкам).
              </div>
            </div>
            <Link href="/collections" className="text-sm font-medium hover:underline">
              Открыть каталог →
            </Link>
          </div>

          <div className="mt-4">
            <CollectionsFromDb userId={user.id} />
          </div>
        </section>
      </div>
    </main>
  );
}

async function CollectionsFromDb({ userId }: { userId: string }) {
  const statuses = await prisma.userCollectionStatus.findMany({
    where: { userId },
    select: {
      status: true,
      qty: true,
      cardItem: { select: { collectionId: true } },
    },
    take: 50_000,
  });

  const byCollection = new Map<string, { owned: number; wanted: number; forTrade: number }>();
  for (const s of statuses) {
    const cid = s.cardItem.collectionId;
    const cur = byCollection.get(cid) ?? { owned: 0, wanted: 0, forTrade: 0 };
    const qty = Math.max(1, s.qty ?? 1);
    if (s.status === "owned") cur.owned += qty;
    else if (s.status === "wanted") cur.wanted += qty;
    else if (s.status === "forTrade") cur.forTrade += qty;
    byCollection.set(cid, cur);
  }

  const collectionIds = Array.from(byCollection.keys());
  if (!collectionIds.length) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 dark:border-white/10 dark:bg-black/30 dark:text-zinc-200">
        Пока нет отмеченных карточек. Откройте коллекцию и отметьте «есть / нужно / на обмен».
      </div>
    );
  }

  const collections = await prisma.collection.findMany({
    where: { id: { in: collectionIds } },
    select: {
      id: true,
      slug: true,
      title: true,
      year: true,
      type: true,
      _count: { select: { items: true } },
    },
    orderBy: { title: "asc" },
    take: 200,
  });

  return (
    <div className="grid gap-3">
      {collections.map((c) => {
        const counts = byCollection.get(c.id) ?? { owned: 0, wanted: 0, forTrade: 0 };
        const totalItems = c._count.items;
        const pct = totalItems ? Math.round((counts.owned / totalItems) * 100) : 0;
        return (
          <Link
            key={c.id}
            href={`/me/collections/${c.slug}`}
            className="rounded-2xl border border-zinc-200 bg-white p-4 hover:border-zinc-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  {c.type}
                  {c.year ? ` · ${c.year}` : ""} · {totalItems} шт.
                </div>
                <div className="mt-1 text-base font-semibold tracking-tight">{c.title}</div>
              </div>

              <div className="min-w-[220px]">
                <div className="flex items-center justify-between text-xs text-zinc-600 dark:text-zinc-300">
                  <div>Прогресс</div>
                  <div>{pct}%</div>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10">
                  <div className="h-full rounded-full bg-zinc-900 dark:bg-white" style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                  <span className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-white/10">
                    Есть: {counts.owned}
                  </span>
                  <span className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-white/10">
                    Нужно: {counts.wanted}
                  </span>
                  <span className="rounded-full bg-zinc-100 px-2 py-1 dark:bg-white/10">
                    На обмен: {counts.forTrade}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

