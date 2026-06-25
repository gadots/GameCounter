import { describe, it, expect } from 'vitest';
import skullKing from '../skull-king';

function score(values: Record<string, number | boolean>, round = 5) {
  return skullKing.score(values, { round, total_rounds: 10 });
}

const base = { bid: 0, won: 0, skull_king: false, pirates: 0, standard_14s: 0, black_14: false, loot: 0 };

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

  it('adds 40 for skull_king bonus (Sirena captura Skull King)', () => {
    expect(score({ ...base, bid: 3, won: 3, skull_king: true })).toBe(100);
  });

  it('adds 30 per pirate captured by Skull King', () => {
    expect(score({ ...base, bid: 1, won: 1, pirates: 2 })).toBe(80);
  });

  it('adds 10 per colored 14 captured', () => {
    expect(score({ ...base, bid: 1, won: 1, standard_14s: 2 })).toBe(40);
    expect(score({ ...base, bid: 1, won: 1, standard_14s: 3 })).toBe(50);
  });

  it('adds 20 for black 14 (Jolly Roger) captured', () => {
    expect(score({ ...base, bid: 1, won: 1, black_14: true })).toBe(40);
  });

  it('adds 20 per loot card captured', () => {
    expect(score({ ...base, bid: 1, won: 1, loot: 1 })).toBe(40);
    expect(score({ ...base, bid: 1, won: 1, loot: 2 })).toBe(60);
  });

  it('stacks all bonuses', () => {
    // bid=2, won=2: 40 + skull_king:40 + pirates:1*30 + standard_14s:1*10 + black_14:20 + loot:1*20 = 160
    expect(score({ bid: 2, won: 2, skull_king: true, pirates: 1, standard_14s: 1, black_14: true, loot: 1 })).toBe(160);
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

  it('has complete, advanced and standard modes', () => {
    const modeIds = skullKing.metadata.modes?.map(m => m.id);
    expect(modeIds).toEqual(['complete', 'advanced', 'standard']);
  });

  it('defaults to complete mode', () => {
    expect(skullKing.metadata.default_mode).toBe('complete');
  });
});

describe('Skull King modes — getInputs', () => {
  it('complete mode exposes all inputs including 14s and loot', () => {
    const ids = skullKing.getInputs!('complete').map(i => i.id);
    expect(ids).toEqual(['bid', 'won', 'skull_king', 'pirates', 'standard_14s', 'black_14', 'loot']);
  });

  it('advanced mode exposes skull_king and pirates only', () => {
    const ids = skullKing.getInputs!('advanced').map(i => i.id);
    expect(ids).toEqual(['bid', 'won', 'skull_king', 'pirates']);
  });

  it('standard mode only exposes bid and won', () => {
    const ids = skullKing.getInputs!('standard').map(i => i.id);
    expect(ids).toEqual(['bid', 'won']);
  });

  it('unknown mode falls back to complete inputs', () => {
    const ids = skullKing.getInputs!('').map(i => i.id);
    expect(ids).toEqual(['bid', 'won', 'skull_king', 'pirates', 'standard_14s', 'black_14', 'loot']);
  });
});

describe('Skull King modes — scoring', () => {
  function scoreMode(values: Record<string, number | boolean>, mode: string, round = 5) {
    return skullKing.score(values, { round, total_rounds: 10, mode_id: mode });
  }

  it('complete mode applies all bonuses on perfect prediction', () => {
    // bid=2, won=2: 40 + skull_king:40 + pirates:1*30 + standard_14s:1*10 + black_14:20 + loot:1*20 = 160
    expect(scoreMode({ ...base, bid: 2, won: 2, skull_king: true, pirates: 1, standard_14s: 1, black_14: true, loot: 1 }, 'complete')).toBe(160);
  });

  it('advanced mode applies skull_king and pirate bonuses but not 14s or loot', () => {
    // bid=2, won=2: 40 + skull_king:40 + pirates:1*30 = 110 (14s and loot ignored)
    expect(scoreMode({ ...base, bid: 2, won: 2, skull_king: true, pirates: 1, standard_14s: 2, black_14: true, loot: 2 }, 'advanced')).toBe(110);
  });

  it('standard mode ignores all bonuses even if present', () => {
    // bid=2, won=2 → 40, all bonuses ignored
    expect(scoreMode({ ...base, bid: 2, won: 2, skull_king: true, pirates: 2 }, 'standard')).toBe(40);
  });

  it('standard mode still scores bid=0 correctly', () => {
    expect(scoreMode({ ...base, bid: 0, won: 0 }, 'standard', 3)).toBe(30);
  });
});
