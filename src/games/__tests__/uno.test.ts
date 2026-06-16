import { describe, it, expect } from 'vitest';
import type { GameModule } from '../../lib/types';
import unoModule from '../uno';

const uno = unoModule as GameModule;
const ctx = { round: 1 };

describe('UNO score()', () => {
  it('returns 0 when no points earned', () => {
    expect(uno.score({ points_earned: 0 }, ctx)).toBe(0);
  });

  it('returns points_earned directly', () => {
    expect(uno.score({ points_earned: 47 }, ctx)).toBe(47);
  });

  it('handles large point values', () => {
    expect(uno.score({ points_earned: 250 }, ctx)).toBe(250);
  });

  it('handles exactly 500 (winning total)', () => {
    expect(uno.score({ points_earned: 500 }, ctx)).toBe(500);
  });
});

describe('UNO metadata', () => {
  it('has per_round scoring mode', () => {
    expect(uno.metadata.scoring_mode).toBe('per_round');
  });

  it('has target_score of 500', () => {
    expect(uno.metadata.target_score).toBe(500);
  });

  it('has bgg_id 2223', () => {
    expect(uno.metadata.bgg_id).toBe(2223);
  });
});
