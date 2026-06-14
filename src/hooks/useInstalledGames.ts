import { useCallback, useSyncExternalStore } from 'react';
import { installedGamesStorage } from '../lib/storage';

export function useInstalledGames() {
  const installed = useSyncExternalStore(installedGamesStorage.subscribe, installedGamesStorage.getAll);

  const install = useCallback((game_id: string) => {
    installedGamesStorage.install(game_id);
  }, []);

  const uninstall = useCallback((game_id: string) => {
    installedGamesStorage.uninstall(game_id);
  }, []);

  const toggleFavorite = useCallback((game_id: string) => {
    installedGamesStorage.toggleFavorite(game_id);
  }, []);

  const isInstalled = useCallback((game_id: string) => installed.some(g => g.game_id === game_id), [installed]);

  return { installed, install, uninstall, toggleFavorite, isInstalled };
}
