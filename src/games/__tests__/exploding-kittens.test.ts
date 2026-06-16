import { describe, it, expect } from 'vitest';
import type { GameModule } from '../../lib/types';
import explodingKittensModule from '../exploding-kittens';

const explodingKittens = explodingKittensModule as GameModule;
const ctx = { round: 1 };

describe('Exploding Kittens score()', () => {
  it('returns 1 when player won the round', () => {
    expect(explodingKittens.score({ won: true }, ctx)).toBe(1);
  });

  it('returns 0 when player did not win the round', () => {
    expect(explodingKittens.score({ won: false }, ctx)).toBe(0);
  });
});

describe('Exploding Kittens metadata', () => {
  it('has per_round scoring mode', () => {
    expect(explodingKittens.metadata.scoring_mode).toBe('per_round');
  });

  it('supports 2-5 players', () => {
    expect(explodingKittens.metadata.min_players).toBe(2);
    expect(explodingKittens.metadata.max_players).toBe(5);
  });

  it('has bgg_id 172225', () => {
    expect(explodingKittens.metadata.bgg_id).toBe(172225);
  });
});
