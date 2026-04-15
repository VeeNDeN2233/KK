import type { MockCardItem, MockCollection } from "@/lib/mock";

type StoredCollections = {
  collections: MockCollection[];
};

function keyCollections() {
  return "ck:collections:v1";
}

function keyCards(slug: string) {
  return `ck:cards:${slug}:v1`;
}

export function loadCollections(): MockCollection[] | null {
  try {
    const raw = localStorage.getItem(keyCollections());
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredCollections;
    return parsed.collections ?? null;
  } catch {
    return null;
  }
}

export function saveCollections(collections: MockCollection[]) {
  try {
    const payload: StoredCollections = { collections };
    localStorage.setItem(keyCollections(), JSON.stringify(payload));
  } catch {
    // ignore
  }
}

export function loadCards(slug: string): MockCardItem[] | null {
  try {
    const raw = localStorage.getItem(keyCards(slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { cards: MockCardItem[] };
    return parsed.cards ?? null;
  } catch {
    return null;
  }
}

export function saveCards(slug: string, cards: MockCardItem[]) {
  try {
    localStorage.setItem(keyCards(slug), JSON.stringify({ cards }));
  } catch {
    // ignore
  }
}

