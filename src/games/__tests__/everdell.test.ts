import { describe, it, expect } from 'vitest';
import type { GameModule } from '../../lib/types';
import everdellModule from '../everdell';

const everdell = everdellModule as GameModule;
const ctx = { round: 1 };

const zero = { city_vp: 0, events: 0, journey: 0, leftovers: 0 };

describe('Everdell score()', () => {
  it('returns 0 for all-zero inputs', () => {
    expect(everdell.score(zero, ctx)).toBe(0);
  });

  it('counts city card VP directly', () => {
    expect(everdell.score({ ...zero, city_vp: 30 }, ctx)).toBe(30);
  });

  it('adds event and milestone VP', () => {
    expect(everdell.score({ ...zero, events: 9 }, ctx)).toBe(9);
  });

  it('adds journey VP', () => {
    expect(everdell.score({ ...zero, journey: 3 }, ctx)).toBe(3);
  });

  it('adds leftover resource VP', () => {
    expect(everdell.score({ ...zero, leftovers: 2 }, ctx)).toBe(2);
  });

  it('sums all categories correctly', () => {
    expect(everdell.score({ city_vp: 10, events: 6, journey: 2, leftovers: 1 }, ctx)).toBe(19);
  });

  it('computes typical game score correctly', () => {
    // city_vp=30, events=9, journey=3, leftovers=2 = 44
    expect(everdell.score({ city_vp: 30, events: 9, journey: 3, leftovers: 2 }, ctx)).toBe(44);
  });
});

describe('Everdell metadata', () => {
  it('has scoring_mode end_of_game', () => {
    expect(everdell.metadata.scoring_mode).toBe('end_of_game');
  });

  it('supports 1–4 players', () => {
    expect(everdell.metadata.min_players).toBe(1);
    expect(everdell.metadata.max_players).toBe(4);
  });
});
