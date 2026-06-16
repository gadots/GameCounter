import { describe, it, expect } from 'vitest';
import type { GameModule } from '../../lib/types';
import kingOfTokyoModule from '../king-of-tokyo';

const kot = kingOfTokyoModule as GameModule;
const ctx = { round: 1 };

describe('King of Tokyo score()', () => {
  it('returns 3 when vp=3', () => {
    expect(kot.score({ vp: 3 }, ctx)).toBe(3);
  });

  it('returns 0 when vp=0', () => {
    expect(kot.score({ vp: 0 }, ctx)).toBe(0);
  });

  it('returns exact vp value', () => {
    expect(kot.score({ vp: 7 }, ctx)).toBe(7);
  });

  it('accumulates correctly across rounds', () => {
    const r1 = kot.score({ vp: 2 }, { round: 1 });
    const r2 = kot.score({ vp: 5 }, { round: 2 });
    expect(r1 + r2).toBe(7);
  });
});

describe('King of Tokyo metadata', () => {
  it('has scoring_mode per_round', () => {
    expect(kot.metadata.scoring_mode).toBe('per_round');
  });

  it('has target_score of 20', () => {
    expect(kot.metadata.target_score).toBe(20);
  });

  it('supports 2–6 players', () => {
    expect(kot.metadata.min_players).toBe(2);
    expect(kot.metadata.max_players).toBe(6);
  });

  it('has correct bgg_id', () => {
    expect(kot.metadata.bgg_id).toBe(70323);
  });

  it('has dados tag', () => {
    expect(kot.metadata.tags).toContain('dados');
  });
});
