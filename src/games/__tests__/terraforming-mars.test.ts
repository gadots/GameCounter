import { describe, it, expect } from 'vitest';
import type { GameModule } from '../../lib/types';
import tfmModule from '../terraforming-mars';

const tfm = tfmModule as GameModule;
const ctx = { round: 1 };

const base = { tr: 20, greenery: 0, city: 0, milestones: 0, awards_1st: 0, awards_2nd: 0, card_vp: 0 };

describe('Terraforming Mars score()', () => {
  it('contributes TR directly to score', () => {
    expect(tfm.score({ ...base, tr: 25 }, ctx)).toBe(25);
  });

  it('adds 1 VP per greenery tile', () => {
    expect(tfm.score({ ...base, greenery: 4 }, ctx)).toBe(24);
  });

  it('adds city adjacency VP directly', () => {
    expect(tfm.score({ ...base, city: 3 }, ctx)).toBe(23);
  });

  it('adds 5 VP per milestone', () => {
    expect(tfm.score({ ...base, milestones: 2 }, ctx)).toBe(30);
  });

  it('adds 5 VP per first-place award', () => {
    expect(tfm.score({ ...base, awards_1st: 1 }, ctx)).toBe(25);
  });

  it('adds 2 VP per second-place award', () => {
    expect(tfm.score({ ...base, awards_2nd: 1 }, ctx)).toBe(22);
  });

  it('adds card VP directly', () => {
    expect(tfm.score({ ...base, card_vp: 15 }, ctx)).toBe(35);
  });

  it('computes typical winning score correctly', () => {
    // tr=28, greenery=4, city=3, milestones=2, awards_1st=1, awards_2nd=1, card_vp=15
    // = 28+4+3+10+5+2+15 = 67
    expect(tfm.score({ tr: 28, greenery: 4, city: 3, milestones: 2, awards_1st: 1, awards_2nd: 1, card_vp: 15 }, ctx)).toBe(67);
  });
});

describe('Terraforming Mars metadata', () => {
  it('has scoring_mode end_of_game', () => {
    expect(tfm.metadata.scoring_mode).toBe('end_of_game');
  });

  it('supports 1–5 players', () => {
    expect(tfm.metadata.min_players).toBe(1);
    expect(tfm.metadata.max_players).toBe(5);
  });
});
