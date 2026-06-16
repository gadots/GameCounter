import { describe, it, expect } from 'vitest';
import type { GameModule } from '../../lib/types';
import loveLetterModule from '../love-letter';

const loveLetter = loveLetterModule as GameModule;
const ctx = { round: 1 };

describe('Love Letter score()', () => {
  it('returns 1 when player won the round', () => {
    expect(loveLetter.score({ won: true }, ctx)).toBe(1);
  });

  it('returns 0 when player lost the round', () => {
    expect(loveLetter.score({ won: false }, ctx)).toBe(0);
  });
});

describe('Love Letter metadata', () => {
  it('has per_round scoring mode', () => {
    expect(loveLetter.metadata.scoring_mode).toBe('per_round');
  });
});
