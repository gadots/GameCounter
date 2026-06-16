import { describe, it, expect } from 'vitest';
import type { GameModule } from '../../lib/types';
import theCrewModule from '../the-crew';

const theCrew = theCrewModule as GameModule;
const ctx = { round: 1 };

describe('The Crew score()', () => {
  it('returns 1 when mission is completed', () => {
    expect(theCrew.score({ completed: true, mission: 1 }, ctx)).toBe(1);
  });

  it('returns 0 when mission is not completed', () => {
    expect(theCrew.score({ completed: false, mission: 1 }, ctx)).toBe(0);
  });

  it('mission number does not affect score', () => {
    expect(theCrew.score({ completed: true, mission: 50 }, ctx)).toBe(1);
    expect(theCrew.score({ completed: false, mission: 50 }, ctx)).toBe(0);
  });

  it('returns 1 for any completed mission', () => {
    expect(theCrew.score({ completed: true, mission: 25 }, ctx)).toBe(1);
  });

  it('returns 0 for failed mission regardless of round', () => {
    expect(theCrew.score({ completed: false, mission: 10 }, { round: 5 })).toBe(0);
  });
});

describe('The Crew metadata', () => {
  it('is cooperative', () => {
    expect(theCrew.metadata.cooperative).toBe(true);
  });

  it('has per_round scoring_mode', () => {
    expect(theCrew.metadata.scoring_mode).toBe('per_round');
  });

  it('supports 2–5 players', () => {
    expect(theCrew.metadata.min_players).toBe(2);
    expect(theCrew.metadata.max_players).toBe(5);
  });
});
