import { describe, it, expect } from 'vitest';
import type { GameModule } from '../../lib/types';
import viticultureModule from '../viticulture';

const viticulture = viticultureModule as GameModule;
const ctx = { round: 1 };

describe('Viticulture score()', () => {
  it('returns VP track position directly', () => {
    expect(viticulture.score({ vp: 20 }, ctx)).toBe(20);
  });

  it('returns 15 when vp=15', () => {
    expect(viticulture.score({ vp: 15 }, ctx)).toBe(15);
  });

  it('returns 0 when vp=0', () => {
    expect(viticulture.score({ vp: 0 }, ctx)).toBe(0);
  });

  it('returns 25 when vp=25 (exceeded target)', () => {
    expect(viticulture.score({ vp: 25 }, ctx)).toBe(25);
  });

  it('returns 7 for a mid-game snapshot', () => {
    expect(viticulture.score({ vp: 7 }, ctx)).toBe(7);
  });
});

describe('Viticulture metadata', () => {
  it('has scoring_mode end_of_game', () => {
    expect(viticulture.metadata.scoring_mode).toBe('end_of_game');
  });

  it('has target_score of 20', () => {
    expect(viticulture.metadata.target_score).toBe(20);
  });

  it('supports 2–6 players', () => {
    expect(viticulture.metadata.min_players).toBe(2);
    expect(viticulture.metadata.max_players).toBe(6);
  });
});
