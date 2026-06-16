import { describe, it, expect } from 'vitest';
import type { GameModule } from '../../lib/types';
import sagradaModule from '../sagrada';

const sagrada = sagradaModule as GameModule;
const ctx = { round: 1 };

describe('Sagrada score()', () => {
  it('sums all positive inputs', () => {
    expect(sagrada.score({ private_obj: 10, public_obj: 15, favor_tokens: 2, empty_spaces: 0 }, ctx)).toBe(27);
  });

  it('subtracts empty_spaces from total', () => {
    expect(sagrada.score({ private_obj: 10, public_obj: 10, favor_tokens: 0, empty_spaces: 5 }, ctx)).toBe(15);
  });

  it('returns 0 when all inputs are zero', () => {
    expect(sagrada.score({ private_obj: 0, public_obj: 0, favor_tokens: 0, empty_spaces: 0 }, ctx)).toBe(0);
  });

  it('computes typical game score (private=15, public=20, tokens=3, empty=2 → 36)', () => {
    expect(sagrada.score({ private_obj: 15, public_obj: 20, favor_tokens: 3, empty_spaces: 2 }, ctx)).toBe(36);
  });

  it('can produce negative score if many empty spaces', () => {
    expect(sagrada.score({ private_obj: 0, public_obj: 0, favor_tokens: 0, empty_spaces: 10 }, ctx)).toBe(-10);
  });

  it('favor_tokens add directly to score', () => {
    expect(sagrada.score({ private_obj: 0, public_obj: 0, favor_tokens: 4, empty_spaces: 0 }, ctx)).toBe(4);
  });

  it('private_obj adds to score independently', () => {
    expect(sagrada.score({ private_obj: 20, public_obj: 0, favor_tokens: 0, empty_spaces: 0 }, ctx)).toBe(20);
  });
});

describe('Sagrada metadata', () => {
  it('has end_of_game scoring mode', () => {
    expect(sagrada.metadata.scoring_mode).toBe('end_of_game');
  });

  it('supports 1–4 players', () => {
    expect(sagrada.metadata.min_players).toBe(1);
    expect(sagrada.metadata.max_players).toBe(4);
  });
});
