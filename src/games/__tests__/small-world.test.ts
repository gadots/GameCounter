import { describe, it, expect } from 'vitest';
import type { GameModule } from '../../lib/types';
import smallWorldModule from '../small-world';

const smallWorld = smallWorldModule as GameModule;
const ctx = { round: 1 };

describe('Small World score()', () => {
  it('returns coins directly as score', () => {
    expect(smallWorld.score({ coins: 15 }, ctx)).toBe(15);
  });

  it('returns 0 for 0 coins', () => {
    expect(smallWorld.score({ coins: 0 }, ctx)).toBe(0);
  });

  it('returns 1 for 1 coin', () => {
    expect(smallWorld.score({ coins: 1 }, ctx)).toBe(1);
  });

  it('handles large coin counts', () => {
    expect(smallWorld.score({ coins: 100 }, ctx)).toBe(100);
  });

  it('handles a typical game coin total', () => {
    expect(smallWorld.score({ coins: 47 }, ctx)).toBe(47);
  });
});

describe('Small World metadata', () => {
  it('has end_of_game scoring mode', () => {
    expect(smallWorld.metadata.scoring_mode).toBe('end_of_game');
  });

  it('supports 2–5 players', () => {
    expect(smallWorld.metadata.min_players).toBe(2);
    expect(smallWorld.metadata.max_players).toBe(5);
  });

  it('has correct bgg_id', () => {
    expect(smallWorld.metadata.bgg_id).toBe(40692);
  });
});
