import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInstalledGames } from '../../hooks/useInstalledGames';
import { resetStorageCache } from '../../lib/storage';

beforeEach(() => {
  localStorage.clear();
  resetStorageCache();
});

describe('useInstalledGames', () => {
  it('starts with an empty installed array', () => {
    const { result } = renderHook(() => useInstalledGames());
    expect(result.current.installed).toHaveLength(0);
  });

  it('install adds a game to the installed list', () => {
    const { result } = renderHook(() => useInstalledGames());
    act(() => { result.current.install('catan'); });
    expect(result.current.installed).toHaveLength(1);
    expect(result.current.installed[0].game_id).toBe('catan');
  });

  it('isInstalled returns true after install', () => {
    const { result } = renderHook(() => useInstalledGames());
    act(() => { result.current.install('catan'); });
    expect(result.current.isInstalled('catan')).toBe(true);
  });

  it('isInstalled returns false for a game that was never installed', () => {
    const { result } = renderHook(() => useInstalledGames());
    expect(result.current.isInstalled('nonexistent')).toBe(false);
  });

  it('installing the same game twice results in only one entry', () => {
    const { result } = renderHook(() => useInstalledGames());
    act(() => {
      result.current.install('catan');
      result.current.install('catan');
    });
    expect(result.current.installed).toHaveLength(1);
  });

  it('uninstall removes a game from the installed list', () => {
    const { result } = renderHook(() => useInstalledGames());
    act(() => { result.current.install('catan'); });
    act(() => { result.current.uninstall('catan'); });
    expect(result.current.isInstalled('catan')).toBe(false);
    expect(result.current.installed).toHaveLength(0);
  });

  it('toggleFavorite first call marks game as favorite', () => {
    const { result } = renderHook(() => useInstalledGames());
    act(() => { result.current.install('catan'); });
    act(() => { result.current.toggleFavorite('catan'); });
    const game = result.current.installed.find(g => g.game_id === 'catan');
    expect(game?.is_favorite).toBe(true);
  });

  it('toggleFavorite second call unmarks the favorite', () => {
    const { result } = renderHook(() => useInstalledGames());
    act(() => { result.current.install('catan'); });
    act(() => { result.current.toggleFavorite('catan'); });
    act(() => { result.current.toggleFavorite('catan'); });
    const game = result.current.installed.find(g => g.game_id === 'catan');
    expect(game?.is_favorite).toBe(false);
  });
});
