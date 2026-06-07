import { describe, it, expect } from 'vitest';
import {
  computePlayerTotals,
  determineWinners,
  withWinners,
  computeScore,
  isTargetReached,
} from '../sessionEngine';
import type { Session, GameModule } from '../types';

const mockModule: GameModule = {
  metadata: {
    id: 'test',
    name: 'Test Game',
    min_players: 2,
    max_players: 4,
    scoring_mode: 'per_round',
  },
  inputs: [{ id: 'pts', label: 'Points', type: 'number' }],
  score: ({ pts }) => pts as number,
};

function makeSession(scores: { player_id: string; round: number; computed_score: number }[]): Session {
  return {
    id: 's1',
    game_id: 'test',
    game_name: 'Test Game',
    player_ids: [...new Set(scores.map(s => s.player_id))],
    status: 'active',
    current_round: 1,
    scores: scores.map(s => ({ ...s, raw_inputs: { pts: s.computed_score } })),
    started_at: '2024-01-01T00:00:00.000Z',
  };
}

describe('computePlayerTotals', () => {
  it('sums rounds per player', () => {
    const session = makeSession([
      { player_id: 'a', round: 1, computed_score: 10 },
      { player_id: 'a', round: 2, computed_score: 20 },
      { player_id: 'b', round: 1, computed_score: 15 },
      { player_id: 'b', round: 2, computed_score: 5 },
    ]);
    const totals = computePlayerTotals(session, mockModule);
    const a = totals.find(t => t.player_id === 'a')!;
    const b = totals.find(t => t.player_id === 'b')!;
    expect(a.grand_total).toBe(30);
    expect(b.grand_total).toBe(20);
    expect(a.round_scores).toEqual([10, 20]);
    expect(b.round_scores).toEqual([15, 5]);
  });

  it('returns zero totals for player with no scores', () => {
    const session = makeSession([]);
    session.player_ids = ['x'];
    const totals = computePlayerTotals(session, mockModule);
    expect(totals[0].grand_total).toBe(0);
    expect(totals[0].round_scores).toEqual([]);
  });

  it('handles negative scores', () => {
    const session = makeSession([
      { player_id: 'a', round: 1, computed_score: -10 },
      { player_id: 'a', round: 2, computed_score: 30 },
    ]);
    const totals = computePlayerTotals(session, mockModule);
    expect(totals[0].grand_total).toBe(20);
  });

  it('sorts round_scores by round number', () => {
    const session = makeSession([
      { player_id: 'a', round: 3, computed_score: 30 },
      { player_id: 'a', round: 1, computed_score: 10 },
      { player_id: 'a', round: 2, computed_score: 20 },
    ]);
    const totals = computePlayerTotals(session, mockModule);
    expect(totals[0].round_scores).toEqual([10, 20, 30]);
  });
});

describe('determineWinners', () => {
  it('returns the player with highest total', () => {
    const totals = [
      { player_id: 'a', round_scores: [], grand_total: 30, is_winner: false },
      { player_id: 'b', round_scores: [], grand_total: 20, is_winner: false },
    ];
    expect(determineWinners(totals)).toEqual(['a']);
  });

  it('returns all tied winners', () => {
    const totals = [
      { player_id: 'a', round_scores: [], grand_total: 25, is_winner: false },
      { player_id: 'b', round_scores: [], grand_total: 25, is_winner: false },
      { player_id: 'c', round_scores: [], grand_total: 10, is_winner: false },
    ];
    expect(determineWinners(totals)).toEqual(['a', 'b']);
  });

  it('returns empty array when no players', () => {
    expect(determineWinners([])).toEqual([]);
  });
});

describe('withWinners', () => {
  it('marks winning players', () => {
    const totals = [
      { player_id: 'a', round_scores: [], grand_total: 30, is_winner: false },
      { player_id: 'b', round_scores: [], grand_total: 20, is_winner: false },
    ];
    const result = withWinners(totals);
    expect(result.find(t => t.player_id === 'a')!.is_winner).toBe(true);
    expect(result.find(t => t.player_id === 'b')!.is_winner).toBe(false);
  });

  it('marks all tied players as winners', () => {
    const totals = [
      { player_id: 'a', round_scores: [], grand_total: 20, is_winner: false },
      { player_id: 'b', round_scores: [], grand_total: 20, is_winner: false },
    ];
    const result = withWinners(totals);
    expect(result.every(t => t.is_winner)).toBe(true);
  });
});

describe('computeScore', () => {
  it('delegates to module.score()', () => {
    const result = computeScore(mockModule, { pts: 42 }, { round: 1 });
    expect(result).toBe(42);
  });
});

describe('isTargetReached', () => {
  const moduleWithTarget: GameModule = { ...mockModule, metadata: { ...mockModule.metadata, target_score: 10 } };

  it('returns true when a player reaches the target', () => {
    const totals = [
      { player_id: 'a', round_scores: [], grand_total: 10, is_winner: false },
    ];
    expect(isTargetReached(totals, moduleWithTarget)).toBe(true);
  });

  it('returns false when no player reaches the target', () => {
    const totals = [
      { player_id: 'a', round_scores: [], grand_total: 9, is_winner: false },
    ];
    expect(isTargetReached(totals, moduleWithTarget)).toBe(false);
  });

  it('returns false when module has no target_score', () => {
    const totals = [
      { player_id: 'a', round_scores: [], grand_total: 999, is_winner: false },
    ];
    expect(isTargetReached(totals, mockModule)).toBe(false);
  });
});
