import { describe, it, expect } from 'vitest';
import type { GameModule } from '../../lib/types';
import hanabiModule from '../hanabi';

const hanabi = hanabiModule as GameModule;
const ctx = { round: 1 };

describe('Hanabi score()', () => {
  it('returns fireworks score directly', () => {
    expect(hanabi.score({ fireworks: 20 }, ctx)).toBe(20);
  });

  it('returns 0 for no fireworks', () => {
    expect(hanabi.score({ fireworks: 0 }, ctx)).toBe(0);
  });

  it('returns 25 for perfect score', () => {
    expect(hanabi.score({ fireworks: 25 }, ctx)).toBe(25);
  });
});

describe('Hanabi metadata', () => {
  it('has end_of_game scoring mode', () => {
    expect(hanabi.metadata.scoring_mode).toBe('end_of_game');
  });

  it('has target_score of 25', () => {
    expect(hanabi.metadata.target_score).toBe(25);
  });

  it('is cooperative', () => {
    expect(hanabi.metadata.cooperative).toBe(true);
  });
});
