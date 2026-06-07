import { describe, it, expect } from 'vitest';
import type { GameModule } from '../../lib/types';
import catanModule from '../catan';

// Cast to GameModule so score accepts 2 args as per the interface
const catan = catanModule as GameModule;
const ctx = { round: 1 };

describe('Catan score()', () => {
  it('counts settlements at 1 VP each', () => {
    expect(catan.score({ settlements: 3, cities: 0, longest_road: false, largest_army: false, vp_cards: 0 }, ctx)).toBe(3);
  });

  it('counts cities at 2 VP each', () => {
    expect(catan.score({ settlements: 0, cities: 3, longest_road: false, largest_army: false, vp_cards: 0 }, ctx)).toBe(6);
  });

  it('adds 2 VP for longest road', () => {
    expect(catan.score({ settlements: 0, cities: 0, longest_road: true, largest_army: false, vp_cards: 0 }, ctx)).toBe(2);
  });

  it('adds 2 VP for largest army', () => {
    expect(catan.score({ settlements: 0, cities: 0, longest_road: false, largest_army: true, vp_cards: 0 }, ctx)).toBe(2);
  });

  it('counts VP cards at 1 VP each', () => {
    expect(catan.score({ settlements: 0, cities: 0, longest_road: false, largest_army: false, vp_cards: 2 }, ctx)).toBe(2);
  });

  it('computes a full winning score correctly', () => {
    // 2 settlements + 2 cities + longest_road + vp_cards:2 = 2 + 4 + 2 + 2 = 10
    expect(catan.score({ settlements: 2, cities: 2, longest_road: true, largest_army: false, vp_cards: 2 }, ctx)).toBe(10);
  });

  it('returns 0 for all-zero inputs', () => {
    expect(catan.score({ settlements: 0, cities: 0, longest_road: false, largest_army: false, vp_cards: 0 }, ctx)).toBe(0);
  });
});

describe('Catan metadata', () => {
  it('has correct scoring_mode', () => {
    expect(catan.metadata.scoring_mode).toBe('end_of_game');
  });

  it('has target_score of 10', () => {
    expect(catan.metadata.target_score).toBe(10);
  });

  it('supports 3–4 players', () => {
    expect(catan.metadata.min_players).toBe(3);
    expect(catan.metadata.max_players).toBe(4);
  });
});
