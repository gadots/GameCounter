import type { Player, Session, InstalledGame, AppSettings, CustomGameDef } from './types';

export interface BackupData {
  version: number;
  exported_at?: string;
  players: Player[];
  sessions: Session[];
  installed_games?: InstalledGame[];
  custom_games?: CustomGameDef[];
  settings?: AppSettings;
}

export type BackupValidation =
  | { ok: true; data: BackupData }
  | { ok: false; error: string };

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function isPlayer(v: unknown): v is Player {
  return isObject(v)
    && typeof v.id === 'string'
    && typeof v.name === 'string'
    && typeof v.color === 'string'
    && typeof v.avatar_emoji === 'string';
}

function isSession(v: unknown): v is Session {
  return isObject(v)
    && typeof v.id === 'string'
    && typeof v.game_id === 'string'
    && typeof v.game_name === 'string'
    && Array.isArray(v.player_ids)
    && Array.isArray(v.scores)
    && (v.status === 'active' || v.status === 'completed' || v.status === 'abandoned');
}

// Parses and structurally validates a backup file. Returns a typed result so
// the caller never has to touch `any` or trust unvalidated import data.
export function validateBackup(raw: string): BackupValidation {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: 'No se pudo leer el archivo.' };
  }

  if (!isObject(parsed)) {
    return { ok: false, error: 'El archivo no es un backup válido de GameCounter.' };
  }

  if (typeof parsed.version !== 'number' || !Array.isArray(parsed.players) || !Array.isArray(parsed.sessions)) {
    return { ok: false, error: 'El archivo no es un backup válido de GameCounter.' };
  }

  if (!parsed.players.every(isPlayer)) {
    return { ok: false, error: 'Los datos de jugadores están dañados.' };
  }

  if (!parsed.sessions.every(isSession)) {
    return { ok: false, error: 'Los datos de partidas están dañados.' };
  }

  const installed_games = Array.isArray(parsed.installed_games)
    ? (parsed.installed_games as InstalledGame[])
    : undefined;
  const custom_games = Array.isArray(parsed.custom_games)
    ? (parsed.custom_games as CustomGameDef[])
    : undefined;
  const settings = isObject(parsed.settings)
    ? (parsed.settings as unknown as AppSettings)
    : undefined;

  return {
    ok: true,
    data: {
      version: parsed.version,
      players: parsed.players as Player[],
      sessions: parsed.sessions as Session[],
      installed_games,
      custom_games,
      settings,
    },
  };
}
