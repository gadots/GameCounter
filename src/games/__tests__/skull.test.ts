import { describe, it, expect } from 'vitest';
import type { GameModule } from '../../lib/types';
import skullModule from '../skull';

const skull = skullModule as GameModule;
const ctx = { round: 1 };

describe('Skull score()', () => {
  it('returns 1 when player won the bet', () => {
    expect(skull.score({ won: true }, ctx)).toBe(1);
  });

  it('returns 0 when player lost the bet', () => {
    expect(skull.score({ won: false }, ctx)).toBe(0);
  });

  it('two wins add up to 2 (winning condition)', () => {
    const round1 = skull.score({ won: true }, { round: 1 });
    const round2 = skull.score({ won: true }, { round: 2 });
    expect(round1 + round2).toBe(2);
  });
});

describe('Skull metadata', () => {
  it('has scoring_mode per_round', () => {
    expect(skull.metadata.scoring_mode).toBe('per_round');
  });

  it('has target_score of 2', () => {
    expect(skull.metadata.target_score).toBe(2);
  });

  it('supports 3–6 players', () => {
    expect(skull.metadata.min_players).toBe(3);
    expect(skull.metadata.max_players).toBe(6);
  });

  it('has correct bgg_id', () => {
    expect(skull.metadata.bgg_id).toBe(122522);
  });

  it('has bluff tag', () => {
    expect(skull.metadata.tags).toContain('bluff');
  });
});
