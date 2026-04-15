export type CardStatus = "missing" | "owned" | "wanted" | "forTrade";

export function storageKeyForCollection(slug: string) {
  return `ck:collection:${slug}:statuses:v1`;
}

export function loadStatuses(slug: string): Record<string, CardStatus> {
  try {
    const raw = localStorage.getItem(storageKeyForCollection(slug));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, CardStatus>;
    return parsed ?? {};
  } catch {
    return {};
  }
}

export function saveStatuses(slug: string, statuses: Record<string, CardStatus>) {
  try {
    localStorage.setItem(storageKeyForCollection(slug), JSON.stringify(statuses));
  } catch {
    // ignore
  }
}

