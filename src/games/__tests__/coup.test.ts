import { describe, it, expect } from 'vitest';
import type { GameModule } from '../../lib/types';
import coupModule from '../coup';

const coup = coupModule as GameModule;
const ctx = { round: 1 };

describe('Coup score()', () => {
  it('returns 1 when player won', () => {
    expect(coup.score({ won: true }, ctx)).toBe(1);
  });

  it('returns 0 when player lost', () => {
    expect(coup.score({ won: false }, ctx)).toBe(0);
  });

  it('accumulates wins across multiple rounds', () => {
    const win1 = coup.score({ won: true }, { round: 1 });
    const win2 = coup.score({ won: true }, { round: 2 });
    const loss = coup.score({ won: false }, { round: 3 });
    expect(win1 + win2 + loss).toBe(2);
  });
});

describe('Coup metadata', () => {
  it('has scoring_mode per_round', () => {
    expect(coup.metadata.scoring_mode).toBe('per_round');
  });

  it('has correct bgg_id', () => {
    expect(coup.metadata.bgg_id).toBe(131357);
  });

  it('supports 2–6 players', () => {
    expect(coup.metadata.min_players).toBe(2);
    expect(coup.metadata.max_players).toBe(6);
  });

  it('has bluff tag', () => {
    expect(coup.metadata.tags).toContain('bluff');
  });

  it('is not cooperative', () => {
    expect(coup.metadata.cooperative).toBeUndefined();
  });
});
