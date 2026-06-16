import { describe, it, expect } from 'vitest';
import type { GameModule } from '../../lib/types';
import generalModule from '../generala';

const generala = generalModule as GameModule;
const ctx = { round: 1 };

const zeros = { ones: 0, twos: 0, threes: 0, fours: 0, fives: 0, sixes: 0, escalera: false, full: false, poker: false, generala: false, extra: 0 };

describe('Generala score() — upper section', () => {
  it('counts ones at 1 VP each (5 ones = 5)', () => {
    expect(generala.score({ ...zeros, ones: 5 }, ctx)).toBe(5);
  });

  it('counts twos at 2 VP each (3 twos = 6)', () => {
    expect(generala.score({ ...zeros, twos: 3 }, ctx)).toBe(6);
  });

  it('counts threes at 3 VP each (4 threes = 12)', () => {
    expect(generala.score({ ...zeros, threes: 4 }, ctx)).toBe(12);
  });

  it('counts fours at 4 VP each (3 fours = 12)', () => {
    expect(generala.score({ ...zeros, fours: 3 }, ctx)).toBe(12);
  });

  it('counts fives at 5 VP each (2 fives = 10)', () => {
    expect(generala.score({ ...zeros, fives: 2 }, ctx)).toBe(10);
  });

  it('counts sixes at 6 VP each (5 sixes = 30)', () => {
    expect(generala.score({ ...zeros, sixes: 5 }, ctx)).toBe(30);
  });
});

describe('Generala score() — lower section', () => {
  it('adds 20 for escalera', () => {
    expect(generala.score({ ...zeros, escalera: true }, ctx)).toBe(20);
  });

  it('adds 30 for full', () => {
    expect(generala.score({ ...zeros, full: true }, ctx)).toBe(30);
  });

  it('adds 40 for poker', () => {
    expect(generala.score({ ...zeros, poker: true }, ctx)).toBe(40);
  });

  it('adds 50 for generala', () => {
    expect(generala.score({ ...zeros, generala: true }, ctx)).toBe(50);
  });

  it('adds extra bonus directly', () => {
    expect(generala.score({ ...zeros, extra: 100 }, ctx)).toBe(100);
  });
});

describe('Generala score() — combined', () => {
  it('returns 0 when all inputs are zero/false', () => {
    expect(generala.score(zeros, ctx)).toBe(0);
  });

  it('combines upper and lower sections correctly', () => {
    // 5 sixes (30) + generala (50) + extra (100) = 180
    expect(generala.score({ ...zeros, sixes: 5, generala: true, extra: 100 }, ctx)).toBe(180);
  });

  it('sums all lower combinations', () => {
    // escalera(20) + full(30) + poker(40) + generala(50) = 140
    expect(generala.score({ ...zeros, escalera: true, full: true, poker: true, generala: true }, ctx)).toBe(140);
  });
});

describe('Generala metadata', () => {
  it('has end_of_game scoring mode', () => {
    expect(generala.metadata.scoring_mode).toBe('end_of_game');
  });

  it('has no bgg_id (not on BGG)', () => {
    expect(generala.metadata.bgg_id).toBeUndefined();
  });
});
