import type { CustomGameDef, GameModule, InputValues } from './types';
import { customGamesStorage } from './storage';

const modules = import.meta.glob('../games/*.ts', { eager: true });

function isValidModule(mod: unknown): mod is { default: GameModule } {
  if (!mod || typeof mod !== 'object') return false;
  const m = mod as Record<string, unknown>;
  const def = m.default as GameModule | undefined;
  return (
    !!def &&
    typeof def.metadata?.id === 'string' &&
    typeof def.metadata?.name === 'string' &&
    Array.isArray(def.inputs) &&
    typeof def.score === 'function'
  );
}

export function loadAllModules(): GameModule[] {
  return Object.entries(modules).flatMap(([path, mod]) => {
    if (isValidModule(mod)) return [mod.default];
    console.warn(`[GameCounter] Invalid game module skipped: ${path}`);
    return [];
  });
}

function customGameToModule(def: CustomGameDef): GameModule {
  return {
    metadata: {
      id: def.id,
      name: def.name,
      min_players: def.min_players,
      max_players: def.max_players,
      scoring_mode: def.scoring_mode,
      target_score: def.target_score,
      tags: ['custom'],
    },
    inputs: def.inputs,
    score: (values: InputValues) =>
      def.scoring_rules.reduce((total, rule) => {
        const v = values[rule.input_id];
        if (typeof v === 'boolean') return total + (v ? rule.multiplier : 0);
        if (typeof v === 'number') return total + v * rule.multiplier;
        return total;
      }, 0),
  };
}

// Built-in modules are cached; custom games are merged fresh each call
// (they can change at runtime without a page reload).
let _builtinCache: GameModule[] | null = null;

export function loadAllModules_builtin(): GameModule[] {
  if (!_builtinCache) _builtinCache = loadAllModules();
  return _builtinCache;
}

export function getGameModules(): GameModule[] {
  const builtins = loadAllModules_builtin();
  const customs = customGamesStorage.getAll().map(customGameToModule);
  return [...builtins, ...customs];
}

export function getGameModule(id: string): GameModule | null {
  return getGameModules().find(m => m.metadata.id === id) ?? null;
}
