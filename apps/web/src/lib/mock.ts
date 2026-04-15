export type MockCollection = {
  slug: string;
  title: string;
  year?: number;
  type: string;
  totalItems: number;
};

export type MockCardItem = {
  number: string;
  title?: string;
  series?: string;
};

export const mockCollections: MockCollection[] = [
  {
    slug: "panini_world_cup_2026_adrenalyn_xl",
    title: "PANINI Чемпионат Мира 2026 — Adrenalyn XL",
    year: 2026,
    type: "TCG",
    totalItems: 913,
  },
  {
    slug: "panini_khl_2025-2026",
    title: "PANINI КХЛ 2025-2026",
    year: 2026,
    type: "Stickers",
    totalItems: 464,
  },
];

export const mockCardsByCollection: Record<string, MockCardItem[]> = {
  panini_world_cup_2026_adrenalyn_xl: Array.from({ length: 80 }).map(
    (_, idx) => ({
      number: String(idx + 1),
      title: `Card ${idx + 1}`,
      series: idx < 20 ? "Base" : idx < 40 ? "Special" : "Insert",
    }),
  ),
  "panini_khl_2025-2026": Array.from({ length: 60 }).map((_, idx) => ({
    number: String(idx + 1),
    title: `Sticker ${idx + 1}`,
    series: idx < 30 ? "Players" : "Teams",
  })),
};

