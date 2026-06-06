import { useState, useCallback } from 'react';
import { playersStorage } from '../lib/storage';
import type { Player } from '../lib/types';

function uuid() {
  return crypto.randomUUID();
}

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#14b8a6'];
const EMOJIS = ['🎲', '🏆', '⭐', '🎯', '🃏', '🎮', '🎪', '🎭'];

export function usePlayers() {
  const [players, setPlayers] = useState<Player[]>(() => playersStorage.getAll());

  const refresh = useCallback(() => setPlayers(playersStorage.getAll()), []);

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
    refresh();
    return player;
  }, [refresh]);

  const updatePlayer = useCallback((id: string, patch: Partial<Pick<Player, 'name' | 'color' | 'avatar_emoji'>>) => {
    playersStorage.update(id, patch);
    refresh();
  }, [refresh]);

  const removePlayer = useCallback((id: string) => {
    playersStorage.remove(id);
    refresh();
  }, [refresh]);

  return { players, addPlayer, updatePlayer, removePlayer };
}
