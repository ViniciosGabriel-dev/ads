export type PresenceEntry = {
  pageId: string;
  page: string;
  device: string;
  lastSeen: string;
};

type PresenceStore = {
  visitors: Map<string, PresenceEntry>;
};

function getStore(): PresenceStore {
  const g = globalThis as typeof globalThis & { __presenceStore?: PresenceStore };
  if (!g.__presenceStore) g.__presenceStore = { visitors: new Map() };
  return g.__presenceStore;
}

const STALE_MS = 15_000;

export function ping(pageId: string, page: string, device: string): void {
  const store = getStore();
  store.visitors.set(pageId, { pageId, page, device, lastSeen: new Date().toISOString() });
}

export function leave(pageId: string): void {
  getStore().visitors.delete(pageId);
}

export function getPresence(): PresenceEntry[] {
  const store = getStore();
  const now = Date.now();
  const active: PresenceEntry[] = [];
  for (const [id, entry] of store.visitors) {
    if (now - new Date(entry.lastSeen).getTime() < STALE_MS) {
      active.push(entry);
    } else {
      store.visitors.delete(id);
    }
  }
  return active;
}

export type PresenceSummary = {
  total: number;
  byPage: Record<string, number>;
  entries: PresenceEntry[];
};

export function getPresenceSummary(): PresenceSummary {
  const entries = getPresence();
  const byPage: Record<string, number> = {};
  for (const e of entries) {
    byPage[e.page] = (byPage[e.page] ?? 0) + 1;
  }
  return { total: entries.length, byPage, entries };
}
