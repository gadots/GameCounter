import { describe, it, expect, beforeEach } from 'vitest';
import { sessionsStorage } from '../../lib/storage';
import type { Session, RoundScore } from '../../lib/types';

beforeEach(() => {
  localStorage.clear();
});

function makeScore(player_id: string, round: number, computed_score: number): RoundScore {
  return {
    player_id,
    round,
    raw_inputs: { pts: computed_score },
    computed_score,
  };
}

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: 'sess-1',
    game_id: 'test',
    game_name: 'Test',
    player_ids: ['p1', 'p2'],
    status: 'active',
    current_round: 1,
    scores: [],
    started_at: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

// Pure helper that mirrors undoLastRound logic — tested independently of the hook
function undoLastRound(sessionId: string): Record<string, Record<string, number | boolean>> | null {
  const session = sessionsStorage.getById(sessionId);
  if (!session || session.current_round <= 1) return null;
  const prevRound = session.current_round - 1;

  const prevInputs: Record<string, Record<string, number | boolean>> = {};
  session.player_ids.forEach(pid => {
    const score = session.scores.find(s => s.player_id === pid && s.round === prevRound);
    if (score) prevInputs[pid] = score.raw_inputs;
  });

  sessionsStorage.update(sessionId, {
    scores: session.scores.filter(s => s.round !== prevRound),
    current_round: prevRound,
  });
  return prevInputs;
}

describe('undoLastRound — lógica pura', () => {
  it('devuelve null si current_round es 1 (no hay ronda anterior)', () => {
    sessionsStorage.add(makeSession({ current_round: 1 }));
    const result = undoLastRound('sess-1');
    expect(result).toBeNull();
  });

  it('devuelve null si la sesión no existe', () => {
    const result = undoLastRound('no-existe');
    expect(result).toBeNull();
  });

  it('elimina los scores de la ronda anterior y decrementa current_round', () => {
    sessionsStorage.add(makeSession({
      current_round: 2,
      scores: [
        makeScore('p1', 1, 10),
        makeScore('p2', 1, 20),
      ],
    }));

    undoLastRound('sess-1');

    const session = sessionsStorage.getById('sess-1')!;
    expect(session.current_round).toBe(1);
    expect(session.scores).toHaveLength(0);
  });

  it('devuelve los raw_inputs de la ronda eliminada por jugador', () => {
    sessionsStorage.add(makeSession({
      current_round: 2,
      scores: [
        { player_id: 'p1', round: 1, raw_inputs: { bid: 3, won: 3 }, computed_score: 60 },
        { player_id: 'p2', round: 1, raw_inputs: { bid: 0, won: 0 }, computed_score: 10 },
      ],
    }));

    const result = undoLastRound('sess-1');

    expect(result).not.toBeNull();
    expect(result!['p1']).toEqual({ bid: 3, won: 3 });
    expect(result!['p2']).toEqual({ bid: 0, won: 0 });
  });

  it('preserva scores de otras rondas al deshacer', () => {
    sessionsStorage.add(makeSession({
      current_round: 3,
      scores: [
        makeScore('p1', 1, 10),
        makeScore('p2', 1, 20),
        makeScore('p1', 2, 30),
        makeScore('p2', 2, 40),
      ],
    }));

    undoLastRound('sess-1');

    const session = sessionsStorage.getById('sess-1')!;
    expect(session.current_round).toBe(2);
    expect(session.scores).toHaveLength(2);
    expect(session.scores.every(s => s.round === 1)).toBe(true);
  });

  it('dos undos consecutivos retroceden dos rondas', () => {
    sessionsStorage.add(makeSession({
      current_round: 3,
      scores: [
        makeScore('p1', 1, 10),
        makeScore('p2', 1, 20),
        makeScore('p1', 2, 30),
        makeScore('p2', 2, 40),
      ],
    }));

    undoLastRound('sess-1');
    undoLastRound('sess-1');

    const session = sessionsStorage.getById('sess-1')!;
    expect(session.current_round).toBe(1);
    expect(session.scores).toHaveLength(0);
  });
});
