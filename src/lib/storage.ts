import type { Player, Session, InstalledGame, AppSettings } from './types';

const KEYS = {
  players: 'gc_players',
  sessions: 'gc_sessions',
  installedGames: 'gc_installed_games',
  settings: 'gc_settings',
} as const;

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function set<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// ─── Players ──────────────────────────────────────────────────────────────

export const playersStorage = {
  getAll: (): Player[] => get<Player[]>(KEYS.players, []),
  save: (players: Player[]) => set(KEYS.players, players),
  add: (player: Player) => {
    const all = playersStorage.getAll();
    playersStorage.save([...all, player]);
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
  get: (): AppSettings => get<AppSettings>(KEYS.settings, defaultSettings),
  update: (patch: Partial<AppSettings>) => {
    set(KEYS.settings, { ...settingsStorage.get(), ...patch });
  },
};
