import { describe, it, expect } from 'vitest';
import type { GameModule } from '../../lib/types';
import dominionModule from '../dominion';

const dominion = dominionModule as GameModule;
const ctx = { round: 1 };

const zero = { estates: 0, duchies: 0, provinces: 0, colonies: 0, kingdom_vp: 0, curses: 0 };

describe('Dominion score()', () => {
  it('returns 0 for all-zero inputs', () => {
    expect(dominion.score(zero, ctx)).toBe(0);
  });

  it('counts estates at 1 VP each (2 estates = 2)', () => {
    expect(dominion.score({ ...zero, estates: 2 }, ctx)).toBe(2);
  });

  it('counts duchies at 3 VP each (1 duchy = 3)', () => {
    expect(dominion.score({ ...zero, duchies: 1 }, ctx)).toBe(3);
  });

  it('2 fincas + 1 ducado = 5 VP', () => {
    expect(dominion.score({ ...zero, estates: 2, duchies: 1 }, ctx)).toBe(5);
  });

  it('counts provinces at 6 VP each', () => {
    expect(dominion.score({ ...zero, provinces: 2 }, ctx)).toBe(12);
  });

  it('counts colonies at 10 VP each', () => {
    expect(dominion.score({ ...zero, colonies: 3 }, ctx)).toBe(30);
  });

  it('adds kingdom_vp directly', () => {
    expect(dominion.score({ ...zero, kingdom_vp: 7 }, ctx)).toBe(7);
  });

  it('subtracts curses at 1 VP each', () => {
    expect(dominion.score({ ...zero, curses: 4 }, ctx)).toBe(-4);
  });

  it('computes a typical full score correctly', () => {
    // 3 estates + 2 duchies + 1 province + 1 colony + 2 kingdom_vp - 1 curse
    // = 3 + 6 + 6 + 10 + 2 - 1 = 26
    expect(dominion.score({ estates: 3, duchies: 2, provinces: 1, colonies: 1, kingdom_vp: 2, curses: 1 }, ctx)).toBe(26);
  });
});

describe('Dominion metadata', () => {
  it('has scoring_mode end_of_game', () => {
    expect(dominion.metadata.scoring_mode).toBe('end_of_game');
  });

  it('supports 2–4 players', () => {
    expect(dominion.metadata.min_players).toBe(2);
    expect(dominion.metadata.max_players).toBe(4);
  });

  it('has correct bgg_id', () => {
    expect(dominion.metadata.bgg_id).toBe(36218);
  });

  it('has deck-building tag', () => {
    expect(dominion.metadata.tags).toContain('deck-building');
  });
});
