import { describe, it, expect } from 'vitest';
import skullKing from '../skull-king';

function score(values: Record<string, number | boolean>, round = 5) {
  return skullKing.score(values, { round, total_rounds: 10 });
}

const base = { bid: 0, won: 0, skull_king: false, mermaids: 0, pirates: 0, flag_14s: 0 };

describe('Skull King score() — bid === 0', () => {
  it('scores round * 10 when bid=0 and won=0', () => {
    expect(score({ ...base, bid: 0, won: 0 }, 3)).toBe(30);
    expect(score({ ...base, bid: 0, won: 0 }, 10)).toBe(100);
  });

  it('scores -(round * 10) when bid=0 but won > 0', () => {
    expect(score({ ...base, bid: 0, won: 2 }, 4)).toBe(-40);
  });
});

describe('Skull King score() — bid === won (perfect prediction)', () => {
  it('scores bid * 20 with no bonuses', () => {
    expect(score({ ...base, bid: 3, won: 3 })).toBe(60);
  });

  it('adds 30 for skull_king bonus', () => {
    expect(score({ ...base, bid: 3, won: 3, skull_king: true })).toBe(90);
  });

  it('adds 20 per mermaid captured', () => {
    expect(score({ ...base, bid: 2, won: 2, mermaids: 1 })).toBe(60);
    expect(score({ ...base, bid: 2, won: 2, mermaids: 2 })).toBe(80);
  });

  it('adds 30 per pirate captured', () => {
    expect(score({ ...base, bid: 1, won: 1, pirates: 2 })).toBe(80);
  });

  it('adds 20 per flag_14 captured', () => {
    expect(score({ ...base, bid: 1, won: 1, flag_14s: 1 })).toBe(40);
  });

  it('stacks all bonuses', () => {
    // bid=2, won=2: 40 + skull_king:30 + mermaids:1*20 + pirates:1*30 + flag_14s:1*20 = 140
    expect(score({ bid: 2, won: 2, skull_king: true, mermaids: 1, pirates: 1, flag_14s: 1 })).toBe(140);
  });
});

describe('Skull King score() — bid !== won (miss)', () => {
  it('scores negative diff * 10 when bid too high', () => {
    expect(score({ ...base, bid: 5, won: 2 })).toBe(-30);
  });

  it('scores negative diff * 10 when bid too low', () => {
    expect(score({ ...base, bid: 1, won: 4 })).toBe(-30);
  });

  it('gives no bonus points on a miss', () => {
    expect(score({ ...base, bid: 3, won: 1, skull_king: true, pirates: 2 })).toBe(-20);
  });
});

describe('Skull King validate()', () => {
  it('returns null for valid inputs', () => {
    expect(skullKing.validate!({ bid: 3, won: 3 })).toBeNull();
  });

  it('returns error for negative bid', () => {
    expect(skullKing.validate!({ bid: -1, won: 0 })).not.toBeNull();
  });

  it('returns error for negative won', () => {
    expect(skullKing.validate!({ bid: 0, won: -1 })).not.toBeNull();
  });
});

describe('Skull King metadata', () => {
  it('has per_round scoring mode', () => {
    expect(skullKing.metadata.scoring_mode).toBe('per_round');
  });

  it('has 10 total rounds', () => {
    expect(skullKing.metadata.total_rounds).toBe(10);
  });
});
