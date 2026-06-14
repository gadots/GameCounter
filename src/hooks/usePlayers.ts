import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { playersStorage } from '../lib/storage';
import type { Player } from '../lib/types';

function uuid() {
  return crypto.randomUUID();
}

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#14b8a6'];
const EMOJIS = ['🎲', '🏆', '⭐', '🎯', '🃏', '🎮', '🎪', '🎭'];

export function usePlayers() {
  const raw = useSyncExternalStore(playersStorage.subscribe, playersStorage.getAll);

  // raw is a stable reference until the players array mutates, so this sort
  // only re-runs when the data actually changes.
  const players = useMemo(
    () => [...raw].sort((a, b) => a.name.localeCompare(b.name, 'es')),
    [raw],
  );

  const addPlayer = useCallback((name: string) => {
    const all = playersStorage.getAll();
    const player: Player = {
      id: uuid(),
      name: name.trim(),
      color: COLORS[all.length % COLORS.length],
      avatar_emoji: EMOJIS[all.length % EMOJIS.length],
      created_at: new Date().toISOString(),
    };
    playersStorage.add(player);
    return player;
  }, []);

  const updatePlayer = useCallback((id: string, patch: Partial<Pick<Player, 'name' | 'color' | 'avatar_emoji'>>) => {
    playersStorage.update(id, patch);
  }, []);

  const removePlayer = useCallback((id: string) => {
    playersStorage.remove(id);
  }, []);

  return { players, addPlayer, updatePlayer, removePlayer };
}
