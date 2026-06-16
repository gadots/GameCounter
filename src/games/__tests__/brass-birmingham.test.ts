import { describe, it, expect } from 'vitest';
import type { GameModule } from '../../lib/types';
import brassModule from '../brass-birmingham';

const brass = brassModule as GameModule;
const ctx = { round: 1 };

describe('Brass: Birmingham score()', () => {
  it('sums canal VP and rail VP', () => {
    expect(brass.score({ canal_vp: 30, rail_vp: 40 }, ctx)).toBe(70);
  });

  it('works when canal era VP is zero', () => {
    expect(brass.score({ canal_vp: 0, rail_vp: 50 }, ctx)).toBe(50);
  });

  it('works when rail era VP is zero', () => {
    expect(brass.score({ canal_vp: 40, rail_vp: 0 }, ctx)).toBe(40);
  });

  it('returns 0 for all-zero inputs', () => {
    expect(brass.score({ canal_vp: 0, rail_vp: 0 }, ctx)).toBe(0);
  });

  it('computes typical winning score correctly', () => {
    // canal=67, rail=85 → 152
    expect(brass.score({ canal_vp: 67, rail_vp: 85 }, ctx)).toBe(152);
  });

  it('handles high canal VP correctly', () => {
    expect(brass.score({ canal_vp: 100, rail_vp: 20 }, ctx)).toBe(120);
  });
});

describe('Brass: Birmingham metadata', () => {
  it('has scoring_mode end_of_game', () => {
    expect(brass.metadata.scoring_mode).toBe('end_of_game');
  });

  it('supports 2–4 players', () => {
    expect(brass.metadata.min_players).toBe(2);
    expect(brass.metadata.max_players).toBe(4);
  });
});
