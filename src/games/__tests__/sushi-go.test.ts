import { describe, it, expect } from 'vitest';
import type { GameModule } from '../../lib/types';
import sushiGoModule from '../sushi-go';

const sushiGo = sushiGoModule as GameModule;
const ctx = { round: 1 };

const base = { tempura: 0, sashimi: 0, dumplings: 0, nigiri: 0, maki: 0 };

describe('Sushi Go! score()', () => {
  it('returns 0 for all zeros', () => {
    expect(sushiGo.score(base, ctx)).toBe(0);
  });

  it('scores tempura in pairs of 2 at 5 pts each', () => {
    expect(sushiGo.score({ ...base, tempura: 2 }, ctx)).toBe(5);
    expect(sushiGo.score({ ...base, tempura: 3 }, ctx)).toBe(5); // odd one ignored
    expect(sushiGo.score({ ...base, tempura: 4 }, ctx)).toBe(10);
  });

  it('scores sashimi in groups of 3 at 10 pts each', () => {
    expect(sushiGo.score({ ...base, sashimi: 3 }, ctx)).toBe(10);
    expect(sushiGo.score({ ...base, sashimi: 5 }, ctx)).toBe(10); // 2 ignored
    expect(sushiGo.score({ ...base, sashimi: 6 }, ctx)).toBe(20);
  });

  it('scores dumplings using dumpVP table', () => {
    // dumpVP = [0, 1, 3, 6, 10, 15]
    expect(sushiGo.score({ ...base, dumplings: 1 }, ctx)).toBe(1);
    expect(sushiGo.score({ ...base, dumplings: 2 }, ctx)).toBe(3);
    expect(sushiGo.score({ ...base, dumplings: 3 }, ctx)).toBe(6);
    expect(sushiGo.score({ ...base, dumplings: 4 }, ctx)).toBe(10);
    expect(sushiGo.score({ ...base, dumplings: 5 }, ctx)).toBe(15);
  });

  it('adds nigiri points directly', () => {
    expect(sushiGo.score({ ...base, nigiri: 7 }, ctx)).toBe(7);
  });

  it('scores maki using makiVP table (0=0, 1=3, 2=6)', () => {
    expect(sushiGo.score({ ...base, maki: 0 }, ctx)).toBe(0);
    expect(sushiGo.score({ ...base, maki: 1 }, ctx)).toBe(3);
    expect(sushiGo.score({ ...base, maki: 2 }, ctx)).toBe(6);
  });

  it('combines all categories in a typical round', () => {
    // tempura:2=5 + sashimi:3=10 + dumplings:2=3 + nigiri:4 + maki:2=6 = 28
    expect(sushiGo.score({ tempura: 2, sashimi: 3, dumplings: 2, nigiri: 4, maki: 2 }, ctx)).toBe(28);
  });
});

describe('Sushi Go! final_round.score()', () => {
  it('returns 0 for no-bonus pudding (option 0)', () => {
    expect(sushiGo.final_round!.score({ pudding: 0 })).toBe(0);
  });

  it('returns -6 for least pudding penalty (option 1)', () => {
    expect(sushiGo.final_round!.score({ pudding: 1 })).toBe(-6);
  });

  it('returns +6 for most pudding bonus (option 2)', () => {
    expect(sushiGo.final_round!.score({ pudding: 2 })).toBe(6);
  });
});
