import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePlayers } from '../../hooks/usePlayers';
import { resetStorageCache } from '../../lib/storage';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#14b8a6'];

beforeEach(() => {
  localStorage.clear();
  resetStorageCache();
});

describe('usePlayers', () => {
  it('starts with an empty players array', () => {
    const { result } = renderHook(() => usePlayers());
    expect(result.current.players).toHaveLength(0);
  });

  it('adds a player with correct name', () => {
    const { result } = renderHook(() => usePlayers());
    act(() => { result.current.addPlayer('Ana'); });
    expect(result.current.players).toHaveLength(1);
    expect(result.current.players[0].name).toBe('Ana');
  });

  it('trims whitespace from player name on add', () => {
    const { result } = renderHook(() => usePlayers());
    act(() => { result.current.addPlayer('  Bob  '); });
    expect(result.current.players).toHaveLength(1);
    expect(result.current.players[0].name).toBe('Bob');
  });

  it('first player gets COLORS[0] as color', () => {
    const { result } = renderHook(() => usePlayers());
    act(() => { result.current.addPlayer('Ana'); });
    expect(result.current.players[0].color).toBe(COLORS[0]);
  });

  it('two players are returned sorted alphabetically', () => {
    const { result } = renderHook(() => usePlayers());
    act(() => {
      result.current.addPlayer('Zoe');
      result.current.addPlayer('Ana');
    });
    expect(result.current.players).toHaveLength(2);
    expect(result.current.players[0].name).toBe('Ana');
    expect(result.current.players[1].name).toBe('Zoe');
  });

  it('updatePlayer changes the player name', () => {
    const { result } = renderHook(() => usePlayers());
    act(() => { result.current.addPlayer('Ana'); });
    const id = result.current.players[0].id;
    act(() => { result.current.updatePlayer(id, { name: 'Bob' }); });
    expect(result.current.players[0].name).toBe('Bob');
  });

  it('removePlayer removes the player from the list', () => {
    const { result } = renderHook(() => usePlayers());
    act(() => { result.current.addPlayer('Ana'); });
    const id = result.current.players[0].id;
    act(() => { result.current.removePlayer(id); });
    expect(result.current.players).toHaveLength(0);
  });

  it('colors cycle through COLORS array for multiple players', () => {
    const { result } = renderHook(() => usePlayers());
    act(() => {
      result.current.addPlayer('Player1');
      result.current.addPlayer('Player2');
      result.current.addPlayer('Player3');
    });
    result.current.players.forEach(p => {
      expect(COLORS).toContain(p.color);
    });
  });

  it('addPlayer returns the created player object', () => {
    const { result } = renderHook(() => usePlayers());
    let returned: ReturnType<typeof result.current.addPlayer> | undefined;
    act(() => {
      returned = result.current.addPlayer('Ana');
    });
    expect(returned?.name).toBe('Ana');
    expect(returned?.id).toBeDefined();
  });
});
