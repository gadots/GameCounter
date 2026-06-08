import { describe, it, expect, beforeEach } from 'vitest';
import { playersStorage, sessionsStorage, installedGamesStorage } from '../storage';
import type { Player, Session } from '../types';

beforeEach(() => {
  localStorage.clear();
});

function makePlayer(id: string): Player {
  return { id, name: `Player ${id}`, color: '#6366f1', avatar_emoji: '🎲', created_at: '2024-01-01T00:00:00.000Z' };
}

function makeSession(id: string, status: Session['status'] = 'active'): Session {
  return {
    id,
    game_id: 'test',
    game_name: 'Test',
    player_ids: ['p1'],
    status,
    current_round: 1,
    scores: [],
    started_at: '2024-01-01T00:00:00.000Z',
  };
}

describe('playersStorage', () => {
  it('returns empty array when nothing stored', () => {
    expect(playersStorage.getAll()).toEqual([]);
  });

  it('adds and retrieves a player', () => {
    playersStorage.add(makePlayer('p1'));
    expect(playersStorage.getAll()).toHaveLength(1);
    expect(playersStorage.getAll()[0].id).toBe('p1');
  });

  it('updates a player field', () => {
    playersStorage.add(makePlayer('p1'));
    playersStorage.update('p1', { name: 'Updated' });
    expect(playersStorage.getAll()[0].name).toBe('Updated');
  });

  it('removes a player', () => {
    playersStorage.add(makePlayer('p1'));
    playersStorage.add(makePlayer('p2'));
    playersStorage.remove('p1');
    const all = playersStorage.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('p2');
  });

  it('update on unknown id leaves list unchanged', () => {
    playersStorage.add(makePlayer('p1'));
    playersStorage.update('not-exist', { name: 'Ghost' });
    expect(playersStorage.getAll()[0].name).toBe('Player p1');
  });
});

describe('sessionsStorage', () => {
  it('returns null when no active session', () => {
    expect(sessionsStorage.getActive()).toBeNull();
  });

  it('returns the active session', () => {
    sessionsStorage.add(makeSession('s1', 'active'));
    expect(sessionsStorage.getActive()?.id).toBe('s1');
  });

  it('returns null when all sessions are completed', () => {
    sessionsStorage.add(makeSession('s1', 'completed'));
    expect(sessionsStorage.getActive()).toBeNull();
  });

  it('gets session by id', () => {
    sessionsStorage.add(makeSession('s1'));
    expect(sessionsStorage.getById('s1')?.id).toBe('s1');
    expect(sessionsStorage.getById('unknown')).toBeNull();
  });

  it('updates session status', () => {
    sessionsStorage.add(makeSession('s1', 'active'));
    sessionsStorage.update('s1', { status: 'completed' });
    expect(sessionsStorage.getById('s1')?.status).toBe('completed');
    expect(sessionsStorage.getActive()).toBeNull();
  });

  it('removes a session by id', () => {
    sessionsStorage.add(makeSession('s1', 'completed'));
    sessionsStorage.add(makeSession('s2', 'completed'));
    sessionsStorage.remove('s1');
    expect(sessionsStorage.getById('s1')).toBeNull();
    expect(sessionsStorage.getById('s2')).not.toBeNull();
  });
});

describe('installedGamesStorage', () => {
  it('installs a game', () => {
    installedGamesStorage.install('catan');
    expect(installedGamesStorage.isInstalled('catan')).toBe(true);
  });

  it('does not duplicate on double install', () => {
    installedGamesStorage.install('catan');
    installedGamesStorage.install('catan');
    expect(installedGamesStorage.getAll()).toHaveLength(1);
  });

  it('uninstalls a game', () => {
    installedGamesStorage.install('catan');
    installedGamesStorage.uninstall('catan');
    expect(installedGamesStorage.isInstalled('catan')).toBe(false);
  });

  it('returns false for non-installed game', () => {
    expect(installedGamesStorage.isInstalled('not-installed')).toBe(false);
  });

  it('toggles favorite', () => {
    installedGamesStorage.install('catan');
    expect(installedGamesStorage.getAll()[0].is_favorite).toBe(false);
    installedGamesStorage.toggleFavorite('catan');
    expect(installedGamesStorage.getAll()[0].is_favorite).toBe(true);
    installedGamesStorage.toggleFavorite('catan');
    expect(installedGamesStorage.getAll()[0].is_favorite).toBe(false);
  });
});
