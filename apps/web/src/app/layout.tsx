import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CK — Card Kartel",
  description:
    "CK (Card Kartel) — коллекции, чек-листы и обмен коллекционными карточками.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-950 dark:bg-black dark:text-zinc-50">
        <Nav />
        <div className="flex-1">{children}</div>
        <footer className="border-t border-zinc-200/60 py-8 text-sm text-zinc-600 dark:border-white/10 dark:text-zinc-400">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4">
            <div>CK (Card Kartel)</div>
            <div>Коллекции · Обмен · Маркет</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
