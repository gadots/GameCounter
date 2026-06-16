import { describe, it, expect } from 'vitest';
import type { GameModule } from '../../lib/types';
import rootModule from '../root';

const root = rootModule as GameModule;
const ctx = { round: 1 };

describe('Root score()', () => {
  it('returns vp directly', () => {
    expect(root.score({ vp: 15 }, ctx)).toBe(15);
  });

  it('returns 0 for zero vp', () => {
    expect(root.score({ vp: 0 }, ctx)).toBe(0);
  });

  it('returns 30 for winning vp', () => {
    expect(root.score({ vp: 30 }, ctx)).toBe(30);
  });
});

describe('Root metadata', () => {
  it('has end_of_game scoring mode', () => {
    expect(root.metadata.scoring_mode).toBe('end_of_game');
  });

  it('has target_score of 30', () => {
    expect(root.metadata.target_score).toBe(30);
  });
});
