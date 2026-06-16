import { describe, it, expect } from 'vitest';
import type { GameModule } from '../../lib/types';
import agricolaModule from '../agricola';

const agricola = agricolaModule as GameModule;
const ctx = { round: 1 };

// Helper: returns score with all tableVP categories zeroed and neutralised except the one under test.
// When testing a single tableVP category, the 6 others are still 0 each → each contributes -1 VP.
// We isolate by providing a "neutral" base where every other category has a known contribution.
//
// "Neutral base" approach: set each tableVP category to 1 so we know exact contributions:
//   fields=1 → 0,  pastures=1 → +1,  grain=1 → +1,  vegetables=1 → +1,
//   sheep=1  → +1, pigs=1     → +1,  cattle=1 → +1
// With 6 of the 7 fixed at 1, their contribution is:
//   pastures+grain+vegetables+sheep+pigs+cattle = 6 × +1 = +6  (when testing fields)
//   OR replace the tested category: 5 of the non-fields are +1 (=+5), fields stays varied
//
// This is complex. Instead, test the total score directly accounting for all -1 contributions.
// Base with all zeros: 7 tableVP categories × -1 = -7. Overriding one changes that slot.
// When testing fields only: remaining 6 zeros = -6 offset.

const BASE_OFFSET = -6; // 6 other tableVP categories at 0, each -1

// Zeros for non-tableVP inputs (contribute 0)
const neutralExtras = {
  unused_spaces: 0,
  stables: 0,
  house_type: 1, // clay: 0 per room
  room_count: 0,
  family_members: 0,
  bonus_cards: 0,
};

// Set all tableVP categories to zero (each gives -1), then override one for testing
const allZeroVP = {
  fields: 0,
  pastures: 0,
  grain: 0,
  vegetables: 0,
  sheep: 0,
  pigs: 0,
  cattle: 0,
};

function scoreOneVP(override: Record<string, number>) {
  return agricola.score({ ...neutralExtras, ...allZeroVP, ...override }, ctx);
}

describe('Agrícola tableVP — fields', () => {
  // 6 other tableVP zeros = -6 offset; fields alone determines the rest
  it('returns -1 for 0 fields (total: -1 + offset -6 = -7)', () => {
    expect(scoreOneVP({ fields: 0 })).toBe(-1 + BASE_OFFSET);
  });
  it('returns 0 for 1 field (total: 0 + offset -6 = -6)', () => {
    expect(scoreOneVP({ fields: 1 })).toBe(0 + BASE_OFFSET);
  });
  it('returns +1 for 2 fields (total: +1 + offset -6 = -5)', () => {
    expect(scoreOneVP({ fields: 2 })).toBe(1 + BASE_OFFSET);
  });
  it('returns +4 for 5 fields (total: +4 + offset -6 = -2)', () => {
    expect(scoreOneVP({ fields: 5 })).toBe(4 + BASE_OFFSET);
  });
  it('returns +4 for 6+ fields (capped at +4)', () => {
    expect(scoreOneVP({ fields: 6 })).toBe(4 + BASE_OFFSET);
  });
});

describe('Agrícola tableVP — grain', () => {
  it('returns -1 for 0 grain', () => {
    expect(scoreOneVP({ grain: 0 })).toBe(-1 + BASE_OFFSET);
  });
  it('returns +1 for 1 grain', () => {
    expect(scoreOneVP({ grain: 1 })).toBe(1 + BASE_OFFSET);
  });
  it('returns +2 for 4 grain', () => {
    expect(scoreOneVP({ grain: 4 })).toBe(2 + BASE_OFFSET);
  });
  it('returns +3 for 6 grain', () => {
    expect(scoreOneVP({ grain: 6 })).toBe(3 + BASE_OFFSET);
  });
  it('returns +4 for 8+ grain', () => {
    expect(scoreOneVP({ grain: 8 })).toBe(4 + BASE_OFFSET);
    expect(scoreOneVP({ grain: 10 })).toBe(4 + BASE_OFFSET);
  });
});

describe('Agrícola tableVP — sheep', () => {
  it('returns -1 for 0 sheep', () => {
    expect(scoreOneVP({ sheep: 0 })).toBe(-1 + BASE_OFFSET);
  });
  it('returns +1 for 1 sheep', () => {
    expect(scoreOneVP({ sheep: 1 })).toBe(1 + BASE_OFFSET);
  });
  it('returns +2 for 4 sheep', () => {
    expect(scoreOneVP({ sheep: 4 })).toBe(2 + BASE_OFFSET);
  });
  it('returns +4 for 8+ sheep', () => {
    expect(scoreOneVP({ sheep: 8 })).toBe(4 + BASE_OFFSET);
  });
});

describe('Agrícola tableVP — pigs', () => {
  it('returns -1 for 0 pigs', () => {
    expect(scoreOneVP({ pigs: 0 })).toBe(-1 + BASE_OFFSET);
  });
  it('returns +1 for 1 pig', () => {
    expect(scoreOneVP({ pigs: 1 })).toBe(1 + BASE_OFFSET);
  });
  it('returns +2 for 3 pigs', () => {
    expect(scoreOneVP({ pigs: 3 })).toBe(2 + BASE_OFFSET);
  });
  it('returns +4 for 7+ pigs', () => {
    expect(scoreOneVP({ pigs: 7 })).toBe(4 + BASE_OFFSET);
  });
});

describe('Agrícola tableVP — cattle', () => {
  it('returns -1 for 0 cattle', () => {
    expect(scoreOneVP({ cattle: 0 })).toBe(-1 + BASE_OFFSET);
  });
  it('returns +1 for 1 cattle', () => {
    expect(scoreOneVP({ cattle: 1 })).toBe(1 + BASE_OFFSET);
  });
  it('returns +2 for 2 cattle', () => {
    expect(scoreOneVP({ cattle: 2 })).toBe(2 + BASE_OFFSET);
  });
  it('returns +3 for 4 cattle', () => {
    expect(scoreOneVP({ cattle: 4 })).toBe(3 + BASE_OFFSET);
  });
  it('returns +4 for 6+ cattle', () => {
    expect(scoreOneVP({ cattle: 6 })).toBe(4 + BASE_OFFSET);
  });
});

describe('Agrícola house_type calculation', () => {
  // Use all-one tableVP categories so none contribute -1 (each animal/resource at a non-zero level)
  // fields=1→0, pastures=1→+1, grain=1→+1, veg=1→+1, sheep=1→+1, pigs=1→+1, cattle=1→+1 → total tableVP = +6
  const oneEach = { fields: 1, pastures: 1, grain: 1, vegetables: 1, sheep: 1, pigs: 1, cattle: 1 };

  it('wood (house_type=0) subtracts 1 VP per room', () => {
    // tableVP=+6, rooms=3, house_type=0 → 6 + 3*(-1) = 3
    expect(agricola.score({ ...neutralExtras, ...oneEach, house_type: 0, room_count: 3 }, ctx)).toBe(3);
  });

  it('clay (house_type=1) contributes 0 VP per room', () => {
    // tableVP=+6, rooms=3, house_type=1 → 6 + 3*0 = 6
    expect(agricola.score({ ...neutralExtras, ...oneEach, house_type: 1, room_count: 3 }, ctx)).toBe(6);
  });

  it('stone (house_type=2) adds 1 VP per room', () => {
    // tableVP=+6, rooms=3, house_type=2 → 6 + 3*1 = 9
    expect(agricola.score({ ...neutralExtras, ...oneEach, house_type: 2, room_count: 3 }, ctx)).toBe(9);
  });
});

describe('Agrícola family_members', () => {
  const oneEach = { fields: 1, pastures: 1, grain: 1, vegetables: 1, sheep: 1, pigs: 1, cattle: 1 };

  it('contributes 3 VP each', () => {
    // tableVP=+6, family_members=2 → 6 + 2*3 = 12
    expect(agricola.score({ ...neutralExtras, ...oneEach, family_members: 2 }, ctx)).toBe(12);
    // tableVP=+6, family_members=5 → 6 + 5*3 = 21
    expect(agricola.score({ ...neutralExtras, ...oneEach, family_members: 5 }, ctx)).toBe(21);
  });
});

describe('Agrícola unused_spaces', () => {
  const oneEach = { fields: 1, pastures: 1, grain: 1, vegetables: 1, sheep: 1, pigs: 1, cattle: 1 };

  it('subtracts 1 VP per unused space', () => {
    // tableVP=+6, unused_spaces=3 → 6 - 3 = 3
    expect(agricola.score({ ...neutralExtras, ...oneEach, unused_spaces: 3 }, ctx)).toBe(3);
  });
});

describe('Agrícola full integration', () => {
  it('computes a typical end-game score', () => {
    // fields:3=+2, pastures:2=+2, grain:5=+2, vegetables:2=+2, sheep:4=+2, pigs:3=+2, cattle:2=+2
    // unused_spaces:2=-2, stables:1=+1, house_type:2(stone), room_count:3=+3
    // family_members:4=+12, bonus_cards:5
    // tableVP = 2+2+2+2+2+2+2 = 14
    // extras = -2+1+3+12+5 = 19
    // total = 14 + 19 = 33
    const result = agricola.score({
      fields: 3,
      pastures: 2,
      grain: 5,
      vegetables: 2,
      sheep: 4,
      pigs: 3,
      cattle: 2,
      unused_spaces: 2,
      stables: 1,
      house_type: 2,
      room_count: 3,
      family_members: 4,
      bonus_cards: 5,
    }, ctx);
    expect(result).toBe(33);
  });
});

describe('Agrícola metadata', () => {
  it('has end_of_game scoring mode', () => {
    expect(agricola.metadata.scoring_mode).toBe('end_of_game');
  });
});
