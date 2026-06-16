import { describe, it, expect } from 'vitest';
import type { GameModule } from '../../lib/types';
import sevenWondersDuelModule from '../seven-wonders-duel';

const duel = sevenWondersDuelModule as GameModule;
const ctx = { round: 1 };

const zeros = { civilian: 0, science: 0, commerce: 0, wonders: 0, military: 0, progress: 0, treasury: 0 };

describe('7 Wonders Duel score() — treasury floor division', () => {
  it('converts 3 coins to 1 VP', () => {
    expect(duel.score({ ...zeros, treasury: 3 }, ctx)).toBe(1);
  });

  it('converts 2 coins to 0 VP (floor division)', () => {
    expect(duel.score({ ...zeros, treasury: 2 }, ctx)).toBe(0);
  });

  it('converts 9 coins to 3 VP', () => {
    expect(duel.score({ ...zeros, treasury: 9 }, ctx)).toBe(3);
  });

  it('converts 10 coins to 3 VP (floor of 10/3)', () => {
    expect(duel.score({ ...zeros, treasury: 10 }, ctx)).toBe(3);
  });

  it('converts 0 coins to 0 VP', () => {
    expect(duel.score({ ...zeros, treasury: 0 }, ctx)).toBe(0);
  });
});

describe('7 Wonders Duel score() — all categories', () => {
  it('returns 0 when all inputs are zero', () => {
    expect(duel.score(zeros, ctx)).toBe(0);
  });

  it('sums all categories correctly', () => {
    // civilian(12) + science(9) + commerce(5) + wonders(7) + military(5) + progress(6) + treasury(9→3) = 47
    expect(duel.score({ civilian: 12, science: 9, commerce: 5, wonders: 7, military: 5, progress: 6, treasury: 9 }, ctx)).toBe(47);
  });

  it('counts civilian VP directly', () => {
    expect(duel.score({ ...zeros, civilian: 10 }, ctx)).toBe(10);
  });

  it('counts military tokens directly (only positive in 7WD)', () => {
    expect(duel.score({ ...zeros, military: 5 }, ctx)).toBe(5);
  });

  it('counts progress tokens directly', () => {
    expect(duel.score({ ...zeros, progress: 6 }, ctx)).toBe(6);
  });
});

describe('7 Wonders Duel metadata', () => {
  it('supports exactly 2 players', () => {
    expect(duel.metadata.min_players).toBe(2);
    expect(duel.metadata.max_players).toBe(2);
  });

  it('has end_of_game scoring mode', () => {
    expect(duel.metadata.scoring_mode).toBe('end_of_game');
  });
});
