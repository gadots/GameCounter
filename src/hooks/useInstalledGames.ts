import { useState, useCallback } from 'react';
import { installedGamesStorage } from '../lib/storage';

export function useInstalledGames() {
  const [installed, setInstalled] = useState(() => installedGamesStorage.getAll());

  const refresh = useCallback(() => setInstalled(installedGamesStorage.getAll()), []);

  const install = useCallback((game_id: string) => {
    installedGamesStorage.install(game_id);
    refresh();
  }, [refresh]);

  const uninstall = useCallback((game_id: string) => {
    installedGamesStorage.uninstall(game_id);
    refresh();
  }, [refresh]);

  const toggleFavorite = useCallback((game_id: string) => {
    installedGamesStorage.toggleFavorite(game_id);
    refresh();
  }, [refresh]);

  const isInstalled = useCallback((game_id: string) => installed.some(g => g.game_id === game_id), [installed]);

  return { installed, install, uninstall, toggleFavorite, isInstalled };
}
