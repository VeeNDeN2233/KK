export type StoredMessage = {
  id: string;
  at: number;
  from: "me" | "them";
  text: string;
};

function key(username: string) {
  return `ck:messages:${username}:v1`;
}

export function loadThread(username: string): StoredMessage[] {
  try {
    const raw = localStorage.getItem(key(username));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { messages: StoredMessage[] };
    return parsed.messages ?? [];
  } catch {
    return [];
  }
}

export function saveThread(username: string, messages: StoredMessage[]) {
  try {
    localStorage.setItem(key(username), JSON.stringify({ messages }));
  } catch {
    // ignore
  }
}

export function listThreads(): { username: string; lastAt: number }[] {
  try {
    const out: { username: string; lastAt: number }[] = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (!k.startsWith("ck:messages:") || !k.endsWith(":v1")) continue;
      const username = k.slice("ck:messages:".length, -":v1".length);
      const msgs = loadThread(username);
      const lastAt = msgs.at(-1)?.at ?? 0;
      out.push({ username, lastAt });
    }
    out.sort((a, b) => b.lastAt - a.lastAt);
    return out;
  } catch {
    return [];
  }
}

