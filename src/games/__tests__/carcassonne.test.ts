import { describe, it, expect } from 'vitest';
import type { GameModule } from '../../lib/types';
import carcassonneModule from '../carcassonne';

const carcassonne = carcassonneModule as GameModule;
const ctx = { round: 1 };

describe('Carcassonne score()', () => {
  it('returns 0 for all zeros', () => {
    expect(carcassonne.score({ cities: 0, roads: 0, monasteries: 0, farms: 0 }, ctx)).toBe(0);
  });

  it('counts cities points', () => {
    expect(carcassonne.score({ cities: 14, roads: 0, monasteries: 0, farms: 0 }, ctx)).toBe(14);
  });

  it('counts roads points', () => {
    expect(carcassonne.score({ cities: 0, roads: 8, monasteries: 0, farms: 0 }, ctx)).toBe(8);
  });

  it('counts monasteries points', () => {
    expect(carcassonne.score({ cities: 0, roads: 0, monasteries: 9, farms: 0 }, ctx)).toBe(9);
  });

  it('counts farms points', () => {
    expect(carcassonne.score({ cities: 0, roads: 0, monasteries: 0, farms: 12 }, ctx)).toBe(12);
  });

  it('sums all categories', () => {
    expect(carcassonne.score({ cities: 10, roads: 5, monasteries: 7, farms: 9 }, ctx)).toBe(31);
  });
});

describe('Carcassonne metadata', () => {
  it('has end_of_game scoring mode', () => {
    expect(carcassonne.metadata.scoring_mode).toBe('end_of_game');
  });
});
