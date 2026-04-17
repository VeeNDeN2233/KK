import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export default async function Home() {
  const session = await getServerSession(authOptions);
  const isAuthed = !!session?.user?.email;
  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-600 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
            Современный аналог laststicker — фокус на «Мои коллекции»
          </div>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            CK (Card Kartel)
          </h1>
          <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-300">
            Отмечайте карты, которые уже есть, чего не хватает, что готовы
            обменять. Быстро находите людей для обмена в вашем городе или по
            почте.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            {isAuthed ? (
              <Link
                href="/me"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Открыть «Мои коллекции»
              </Link>
            ) : (
              <Link
                href="/auth/login"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              >
                Войти
              </Link>
            )}
            <Link
              href="/collections"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-900 hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              Смотреть каталог коллекций
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-white/5">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-white">
            Главная фишка
          </h2>
          <div className="mt-4 grid gap-3">
            {[
              {
                title: "Чек-лист по коллекции",
                desc: "Отметки «есть / нужно / на обмен» + количество и заметки.",
              },
              {
                title: "Прогресс",
                desc: "Сколько собрано, сколько осталось, что в приоритете.",
              },
              {
                title: "Найти обмен",
                desc: "Подбор людей по совпадениям и географии (город/почта).",
              },
            ].map((i) => (
              <div
                key={i.title}
                className="rounded-xl border border-zinc-200/60 bg-zinc-50 p-4 dark:border-white/10 dark:bg-black/30"
              >
                <div className="font-medium">{i.title}</div>
                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                  {i.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
