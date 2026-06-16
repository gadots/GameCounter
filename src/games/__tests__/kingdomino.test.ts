import { describe, it, expect } from 'vitest';
import type { GameModule } from '../../lib/types';
import kingdominoModule from '../kingdomino';

const kingdomino = kingdominoModule as GameModule;
const ctx = { round: 1 };

describe('Kingdomino score()', () => {
  it('returns 42 when score=42', () => {
    expect(kingdomino.score({ score: 42 }, ctx)).toBe(42);
  });

  it('returns 0 when score=0', () => {
    expect(kingdomino.score({ score: 0 }, ctx)).toBe(0);
  });

  it('returns exact score value', () => {
    expect(kingdomino.score({ score: 15 }, ctx)).toBe(15);
  });

  it('returns 10 for centered castle bonus', () => {
    expect(kingdomino.score({ score: 10 }, ctx)).toBe(10);
  });
});

describe('Kingdomino metadata', () => {
  it('has scoring_mode end_of_game', () => {
    expect(kingdomino.metadata.scoring_mode).toBe('end_of_game');
  });

  it('supports 2–4 players', () => {
    expect(kingdomino.metadata.min_players).toBe(2);
    expect(kingdomino.metadata.max_players).toBe(4);
  });

  it('has correct bgg_id', () => {
    expect(kingdomino.metadata.bgg_id).toBe(204583);
  });

  it('has losetas tag', () => {
    expect(kingdomino.metadata.tags).toContain('losetas');
  });
});
