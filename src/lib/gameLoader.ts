import type { GameModule } from './types';

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

let _cache: GameModule[] | null = null;

export function getGameModules(): GameModule[] {
  if (!_cache) _cache = loadAllModules();
  return _cache;
}

export function getGameModule(id: string): GameModule | null {
  return getGameModules().find(m => m.metadata.id === id) ?? null;
}
