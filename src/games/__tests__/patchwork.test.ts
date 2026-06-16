import { describe, it, expect } from 'vitest';
import type { GameModule } from '../../lib/types';
import patchworkModule from '../patchwork';

const patchwork = patchworkModule as GameModule;
const ctx = { round: 1 };

describe('Patchwork score()', () => {
  it('returns buttons minus penalty for empty spaces', () => {
    expect(patchwork.score({ buttons: 10, empty_spaces: 3, special_tile: false }, ctx)).toBe(4);
  });

  it('adds 7 for special tile bonus', () => {
    expect(patchwork.score({ buttons: 5, empty_spaces: 0, special_tile: true }, ctx)).toBe(12);
  });

  it('returns negative when empty spaces outweigh buttons', () => {
    expect(patchwork.score({ buttons: 0, empty_spaces: 5, special_tile: false }, ctx)).toBe(-10);
  });

  it('returns 0 for all zeros', () => {
    expect(patchwork.score({ buttons: 0, empty_spaces: 0, special_tile: false }, ctx)).toBe(0);
  });

  it('combines buttons, penalties, and special tile correctly', () => {
    // 8 - 2*2 + 7 = 11
    expect(patchwork.score({ buttons: 8, empty_spaces: 2, special_tile: true }, ctx)).toBe(11);
  });
});

describe('Patchwork metadata', () => {
  it('has end_of_game scoring mode', () => {
    expect(patchwork.metadata.scoring_mode).toBe('end_of_game');
  });

  it('has max_players of 2', () => {
    expect(patchwork.metadata.max_players).toBe(2);
  });
});
