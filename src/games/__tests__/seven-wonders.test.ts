import { describe, it, expect } from 'vitest';
import type { GameModule } from '../../lib/types';
import sevenWondersModule from '../seven-wonders';

const sevenWonders = sevenWondersModule as GameModule;
const ctx = { round: 1 };

describe('7 Wonders score()', () => {
  it('returns 0 for all zeros', () => {
    expect(sevenWonders.score({ military: 0, treasury: 0, wonders: 0, civilian: 0, commerce: 0, guilds: 0, science: 0 }, ctx)).toBe(0);
  });

  it('converts treasury coins using floor division by 3', () => {
    // 3 coins = 1 VP, 2 coins = 0 VP, 9 coins = 3 VP
    expect(sevenWonders.score({ military: 0, treasury: 3, wonders: 0, civilian: 0, commerce: 0, guilds: 0, science: 0 }, ctx)).toBe(1);
    expect(sevenWonders.score({ military: 0, treasury: 2, wonders: 0, civilian: 0, commerce: 0, guilds: 0, science: 0 }, ctx)).toBe(0);
    expect(sevenWonders.score({ military: 0, treasury: 9, wonders: 0, civilian: 0, commerce: 0, guilds: 0, science: 0 }, ctx)).toBe(3);
  });

  it('allows negative military (defeats)', () => {
    expect(sevenWonders.score({ military: -3, treasury: 0, wonders: 0, civilian: 0, commerce: 0, guilds: 0, science: 0 }, ctx)).toBe(-3);
  });

  it('adds each category directly', () => {
    expect(sevenWonders.score({ military: 5, treasury: 0, wonders: 4, civilian: 7, commerce: 3, guilds: 2, science: 6 }, ctx)).toBe(27);
  });

  it('computes a typical end-game score', () => {
    // military:3 + treasury:6(=2 VP) + wonders:4 + civilian:9 + commerce:2 + guilds:3 + science:8 = 31
    expect(sevenWonders.score({ military: 3, treasury: 6, wonders: 4, civilian: 9, commerce: 2, guilds: 3, science: 8 }, ctx)).toBe(31);
  });

  it('handles zero treasury with other points', () => {
    expect(sevenWonders.score({ military: 2, treasury: 0, wonders: 3, civilian: 5, commerce: 1, guilds: 0, science: 4 }, ctx)).toBe(15);
  });
});

describe('7 Wonders metadata', () => {
  it('has end_of_game scoring mode', () => {
    expect(sevenWonders.metadata.scoring_mode).toBe('end_of_game');
  });
});
