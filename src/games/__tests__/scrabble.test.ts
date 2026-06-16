import { describe, it, expect } from 'vitest';
import type { GameModule } from '../../lib/types';
import scrabbleModule from '../scrabble';

const scrabble = scrabbleModule as GameModule;
const ctx = { round: 1 };

describe('Scrabble score()', () => {
  it('returns word_score directly', () => {
    expect(scrabble.score({ word_score: 24 }, ctx)).toBe(24);
  });

  it('returns 0 for zero word_score', () => {
    expect(scrabble.score({ word_score: 0 }, ctx)).toBe(0);
  });

  it('handles high scoring words', () => {
    expect(scrabble.score({ word_score: 98 }, ctx)).toBe(98);
  });
});

describe('Scrabble final_round.score()', () => {
  it('returns tile_adjustment directly (positive)', () => {
    expect(scrabble.final_round!.score({ tile_adjustment: 15 })).toBe(15);
  });

  it('returns tile_adjustment directly (negative)', () => {
    expect(scrabble.final_round!.score({ tile_adjustment: -8 })).toBe(-8);
  });

  it('returns 0 for zero adjustment', () => {
    expect(scrabble.final_round!.score({ tile_adjustment: 0 })).toBe(0);
  });
});

describe('Scrabble metadata', () => {
  it('has per_round scoring mode', () => {
    expect(scrabble.metadata.scoring_mode).toBe('per_round');
  });
});
