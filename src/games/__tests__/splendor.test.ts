import { describe, it, expect } from 'vitest';
import type { GameModule } from '../../lib/types';
import splendorModule from '../splendor';

const splendor = splendorModule as GameModule;
const ctx = { round: 1 };

describe('Splendor score()', () => {
  it('returns card_points when no nobles', () => {
    expect(splendor.score({ card_points: 10, nobles_count: 0 }, ctx)).toBe(10);
  });

  it('adds 3 VP per noble', () => {
    expect(splendor.score({ card_points: 0, nobles_count: 1 }, ctx)).toBe(3);
    expect(splendor.score({ card_points: 0, nobles_count: 2 }, ctx)).toBe(6);
  });

  it('combines card_points and nobles correctly', () => {
    expect(splendor.score({ card_points: 12, nobles_count: 1 }, ctx)).toBe(15);
  });

  it('returns 0 for all zeros', () => {
    expect(splendor.score({ card_points: 0, nobles_count: 0 }, ctx)).toBe(0);
  });

  it('handles 3 nobles (9 VP) plus card points', () => {
    expect(splendor.score({ card_points: 6, nobles_count: 3 }, ctx)).toBe(15);
  });
});

describe('Splendor metadata', () => {
  it('has end_of_game scoring mode', () => {
    expect(splendor.metadata.scoring_mode).toBe('end_of_game');
  });

  it('has target_score of 15', () => {
    expect(splendor.metadata.target_score).toBe(15);
  });
});
