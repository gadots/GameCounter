import { describe, it, expect } from 'vitest';
import type { GameModule } from '../../lib/types';
import azulModule from '../azul';

const azul = azulModule as GameModule;
const ctx = { round: 1 };

describe('Azul score()', () => {
  it('returns placed points with no floor penalty', () => {
    expect(azul.score({ placed: 10, floor: 0 }, ctx)).toBe(10);
  });

  it('applies floor penalties correctly', () => {
    // penalties = [0, -1, -2, -4, -6, -8, -11, -14]
    expect(azul.score({ placed: 10, floor: 1 }, ctx)).toBe(9);
    expect(azul.score({ placed: 10, floor: 2 }, ctx)).toBe(8);
    expect(azul.score({ placed: 10, floor: 3 }, ctx)).toBe(6);
    expect(azul.score({ placed: 10, floor: 4 }, ctx)).toBe(4);
    expect(azul.score({ placed: 10, floor: 5 }, ctx)).toBe(2);
    expect(azul.score({ placed: 10, floor: 6 }, ctx)).toBe(-1);
    expect(azul.score({ placed: 10, floor: 7 }, ctx)).toBe(-4);
  });

  it('clamps floor at 7 for values above max', () => {
    expect(azul.score({ placed: 10, floor: 8 }, ctx)).toBe(-4);
  });

  it('returns negative when penalty exceeds placed', () => {
    expect(azul.score({ placed: 3, floor: 3 }, ctx)).toBe(-1);
  });
});

describe('Azul final_round.score()', () => {
  it('scores completed rows at 2 VP each', () => {
    expect(azul.final_round!.score({ rows: 3, columns: 0, colors: 0 })).toBe(6);
  });

  it('scores completed columns at 7 VP each', () => {
    expect(azul.final_round!.score({ rows: 0, columns: 2, colors: 0 })).toBe(14);
  });

  it('scores completed colors at 10 VP each', () => {
    expect(azul.final_round!.score({ rows: 0, columns: 0, colors: 1 })).toBe(10);
  });

  it('sums all bonuses', () => {
    // rows:2*2 + columns:3*7 + colors:1*10 = 4 + 21 + 10 = 35
    expect(azul.final_round!.score({ rows: 2, columns: 3, colors: 1 })).toBe(35);
  });

  it('returns 0 for no bonuses', () => {
    expect(azul.final_round!.score({ rows: 0, columns: 0, colors: 0 })).toBe(0);
  });
});
