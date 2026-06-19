import { useCallback, useSyncExternalStore } from 'react';
import { customGamesStorage } from '../lib/storage';
import type { CustomGameDef } from '../lib/types';

export function useCustomGames() {
  const customGames = useSyncExternalStore(
    customGamesStorage.subscribe,
    customGamesStorage.getAll,
  );

  const saveGame = useCallback((game: CustomGameDef) => {
    customGamesStorage.upsert(game);
  }, []);

  const removeGame = useCallback((id: string) => {
    customGamesStorage.remove(id);
  }, []);

  const isCustomGame = useCallback(
    (id: string) => customGames.some(g => g.id === id),
    [customGames],
  );

  return { customGames, saveGame, removeGame, isCustomGame };
}
