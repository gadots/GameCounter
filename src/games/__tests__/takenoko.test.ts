import { describe, it, expect } from 'vitest';
import type { GameModule } from '../../lib/types';
import takenokoModule from '../takenoko';

const takenoko = takenokoModule as GameModule;
const ctx = { round: 1 };

describe('Takenoko score()', () => {
  it('returns 0 when all inputs are zero/false', () => {
    expect(takenoko.score({ plot_pts: 0, garden_pts: 0, panda_pts: 0, emperor: false }, ctx)).toBe(0);
  });

  it('adds 2 VP for emperor seal', () => {
    expect(takenoko.score({ plot_pts: 0, garden_pts: 0, panda_pts: 0, emperor: true }, ctx)).toBe(2);
  });

  it('does not add VP when emperor is false', () => {
    expect(takenoko.score({ plot_pts: 5, garden_pts: 0, panda_pts: 0, emperor: false }, ctx)).toBe(5);
  });

  it('sums plot objectives correctly', () => {
    expect(takenoko.score({ plot_pts: 9, garden_pts: 0, panda_pts: 0, emperor: false }, ctx)).toBe(9);
  });

  it('sums garden objectives correctly', () => {
    expect(takenoko.score({ plot_pts: 0, garden_pts: 16, panda_pts: 0, emperor: false }, ctx)).toBe(16);
  });

  it('sums panda objectives correctly', () => {
    expect(takenoko.score({ plot_pts: 0, garden_pts: 0, panda_pts: 9, emperor: false }, ctx)).toBe(9);
  });

  it('sums all categories with emperor', () => {
    // plot(9) + garden(16) + panda(9) + emperor(2) = 36
    expect(takenoko.score({ plot_pts: 9, garden_pts: 16, panda_pts: 9, emperor: true }, ctx)).toBe(36);
  });

  it('sums all categories without emperor', () => {
    // plot(6) + garden(12) + panda(6) = 24
    expect(takenoko.score({ plot_pts: 6, garden_pts: 12, panda_pts: 6, emperor: false }, ctx)).toBe(24);
  });
});

describe('Takenoko metadata', () => {
  it('has end_of_game scoring mode', () => {
    expect(takenoko.metadata.scoring_mode).toBe('end_of_game');
  });

  it('supports 2–4 players', () => {
    expect(takenoko.metadata.min_players).toBe(2);
    expect(takenoko.metadata.max_players).toBe(4);
  });
});
