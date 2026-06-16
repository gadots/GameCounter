import { describe, it, expect } from 'vitest';
import type { GameModule } from '../../lib/types';
import puertoRicoModule from '../puerto-rico';

const puertoRico = puertoRicoModule as GameModule;
const ctx = { round: 1 };

const zero = { ship_vp: 0, building_vp: 0, large_building: 0 };

describe('Puerto Rico score()', () => {
  it('returns 0 for all-zero inputs', () => {
    expect(puertoRico.score(zero, ctx)).toBe(0);
  });

  it('adds shipping VP', () => {
    expect(puertoRico.score({ ...zero, ship_vp: 22 }, ctx)).toBe(22);
  });

  it('works when ship_vp is zero', () => {
    expect(puertoRico.score({ ship_vp: 0, building_vp: 18, large_building: 0 }, ctx)).toBe(18);
  });

  it('adds building VP', () => {
    expect(puertoRico.score({ ...zero, building_vp: 18 }, ctx)).toBe(18);
  });

  it('building_vp dominates when large enough', () => {
    expect(puertoRico.score({ ship_vp: 5, building_vp: 25, large_building: 0 }, ctx)).toBe(30);
  });

  it('adds large building bonus VP', () => {
    expect(puertoRico.score({ ...zero, large_building: 4 }, ctx)).toBe(4);
  });

  it('sums all three categories correctly', () => {
    expect(puertoRico.score({ ship_vp: 10, building_vp: 10, large_building: 2 }, ctx)).toBe(22);
  });

  it('computes typical game score correctly', () => {
    // ship=22, buildings=18, large=4 → 44
    expect(puertoRico.score({ ship_vp: 22, building_vp: 18, large_building: 4 }, ctx)).toBe(44);
  });
});

describe('Puerto Rico metadata', () => {
  it('has scoring_mode end_of_game', () => {
    expect(puertoRico.metadata.scoring_mode).toBe('end_of_game');
  });

  it('supports 2–5 players', () => {
    expect(puertoRico.metadata.min_players).toBe(2);
    expect(puertoRico.metadata.max_players).toBe(5);
  });
});
