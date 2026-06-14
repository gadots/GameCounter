import type { Player, Session, InstalledGame, AppSettings } from './types';

const KEYS = {
  players: 'gc_players',
  sessions: 'gc_sessions',
  installedGames: 'gc_installed_games',
  settings: 'gc_settings',
} as const;

const KEY_SET = new Set<string>(Object.values(KEYS));

// In-memory cache: localStorage is parsed once per key and the parsed value is
// reused (referentially stable) until a write or a cross-tab change invalidates
// it. This removes the per-render JSON.parse cost and lets useSyncExternalStore
// return a stable snapshot.
const cache = new Map<string, unknown>();
const listeners = new Map<string, Set<() => void>>();

function emit(key: string): void {
  listeners.get(key)?.forEach(fn => fn());
}

// Drops the in-memory cache so subsequent reads re-parse from localStorage.
// Intended for tests, which clear localStorage directly (bypassing `set`).
export function resetStorageCache(): void {
  cache.clear();
}

export function subscribe(key: string, listener: () => void): () => void {
  let set = listeners.get(key);
  if (!set) {
    set = new Set();
    listeners.set(key, set);
  }
  set.add(listener);
  return () => {
    set!.delete(listener);
  };
}

function get<T>(key: string, fallback: T): T {
  if (cache.has(key)) return cache.get(key) as T;
  try {
    const raw = localStorage.getItem(key);
    const value = raw ? (JSON.parse(raw) as T) : fallback;
    cache.set(key, value);
    return value;
  } catch {
    cache.set(key, fallback);
    return fallback;
  }
}

function set<T>(key: string, value: T): void {
  cache.set(key, value);
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota or serialization error — keep the in-memory value so the UI stays
    // consistent within the session even if persistence failed.
  }
  emit(key);
}

// Cross-tab sync: another tab wrote to one of our keys. Drop the stale cache
// entry so the next read re-parses, then notify subscribers.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', e => {
    if (e.key && KEY_SET.has(e.key)) {
      cache.delete(e.key);
      emit(e.key);
    }
  });
}

// ─── Players ──────────────────────────────────────────────────────────────

export const playersStorage = {
  key: KEYS.players,
  subscribe: (listener: () => void) => subscribe(KEYS.players, listener),
  getAll: (): Player[] => get<Player[]>(KEYS.players, []),
  save: (players: Player[]) => set(KEYS.players, players),
  add: (player: Player) => {
    playersStorage.save([...playersStorage.getAll(), player]);
  },
  update: (id: string, patch: Partial<Player>) => {
    const all = playersStorage.getAll().map(p => p.id === id ? { ...p, ...patch } : p);
    playersStorage.save(all);
  },
  remove: (id: string) => {
    playersStorage.save(playersStorage.getAll().filter(p => p.id !== id));
  },
};

// ─── Sessions ─────────────────────────────────────────────────────────────

export const sessionsStorage = {
  key: KEYS.sessions,
  subscribe: (listener: () => void) => subscribe(KEYS.sessions, listener),
  getAll: (): Session[] => get<Session[]>(KEYS.sessions, []),
  save: (sessions: Session[]) => set(KEYS.sessions, sessions),
  getActive: (): Session | null =>
    sessionsStorage.getAll().find(s => s.status === 'active') ?? null,
  getById: (id: string): Session | null =>
    sessionsStorage.getAll().find(s => s.id === id) ?? null,
  add: (session: Session) => {
    sessionsStorage.save([...sessionsStorage.getAll(), session]);
  },
  update: (id: string, patch: Partial<Session>) => {
    const all = sessionsStorage.getAll().map(s => s.id === id ? { ...s, ...patch } : s);
    sessionsStorage.save(all);
  },
  remove: (id: string) => {
    sessionsStorage.save(sessionsStorage.getAll().filter(s => s.id !== id));
  },
};

// ─── Installed Games ──────────────────────────────────────────────────────

export const installedGamesStorage = {
  key: KEYS.installedGames,
  subscribe: (listener: () => void) => subscribe(KEYS.installedGames, listener),
  getAll: (): InstalledGame[] => get<InstalledGame[]>(KEYS.installedGames, []),
  save: (games: InstalledGame[]) => set(KEYS.installedGames, games),
  isInstalled: (game_id: string): boolean =>
    installedGamesStorage.getAll().some(g => g.game_id === game_id),
  install: (game_id: string) => {
    if (installedGamesStorage.isInstalled(game_id)) return;
    installedGamesStorage.save([
      ...installedGamesStorage.getAll(),
      { game_id, installed_at: new Date().toISOString(), is_favorite: false },
    ]);
  },
  uninstall: (game_id: string) => {
    installedGamesStorage.save(installedGamesStorage.getAll().filter(g => g.game_id !== game_id));
  },
  toggleFavorite: (game_id: string) => {
    const all = installedGamesStorage.getAll().map(g =>
      g.game_id === game_id ? { ...g, is_favorite: !g.is_favorite } : g
    );
    installedGamesStorage.save(all);
  },
};

// ─── Settings ─────────────────────────────────────────────────────────────

const defaultSettings: AppSettings = {
  theme: 'system',
  show_running_totals: true,
};

export const settingsStorage = {
  key: KEYS.settings,
  subscribe: (listener: () => void) => subscribe(KEYS.settings, listener),
  get: (): AppSettings => get<AppSettings>(KEYS.settings, defaultSettings),
  update: (patch: Partial<AppSettings>) => {
    set(KEYS.settings, { ...settingsStorage.get(), ...patch });
  },
};
