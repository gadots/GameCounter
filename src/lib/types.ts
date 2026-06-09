// ─── Game Module types ────────────────────────────────────────────────────

export type InputType = 'stepper' | 'number' | 'toggle' | 'select';

export interface InputDef {
  id: string;
  label: string;
  type: InputType;
  min?: number;
  max?: number;
  default?: number | boolean;
  description?: string;
  options?: string[];
}

export type ScoringMode = 'end_of_game' | 'per_round';

export interface GameMetadata {
  id: string;
  name: string;
  min_players: number;
  max_players: number;
  scoring_mode: ScoringMode;
  total_rounds?: number;
  target_score?: number;
  tiebreaker_hint?: string;
  tags?: string[];
  bgg_id?: number;
  image_url?: string;
}

export interface RoundContext {
  round: number;
  total_rounds?: number;
}

export type InputValues = Record<string, number | boolean>;

export interface GameModule {
  metadata: GameMetadata;
  inputs: InputDef[];
  score(values: InputValues, ctx: RoundContext): number;
  validate?(values: InputValues): string | null;
}

// ─── App-level types ──────────────────────────────────────────────────────

export interface Player {
  id: string;
  name: string;
  color: string;
  avatar_emoji: string;
  created_at: string;
}

export type SessionStatus = 'active' | 'completed' | 'abandoned';

export interface RoundScore {
  player_id: string;
  round: number;
  raw_inputs: InputValues;
  computed_score: number;
}

export interface Session {
  id: string;
  game_id: string;
  game_name: string;
  player_ids: string[];
  status: SessionStatus;
  current_round: number;
  scores: RoundScore[];
  started_at: string;
  completed_at?: string;
  winner_ids?: string[];
  player_name_snapshots?: Record<string, string>;
}

export interface InstalledGame {
  game_id: string;
  installed_at: string;
  is_favorite: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  show_running_totals: boolean;
}

// ─── Computed (not persisted) ─────────────────────────────────────────────

export interface PlayerTotals {
  player_id: string;
  round_scores: number[];
  grand_total: number;
  is_winner: boolean;
}
