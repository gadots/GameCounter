import { describe, it, expect } from 'vitest';
import type { GameModule } from '../../lib/types';
import pandemicModule from '../pandemic';

const pandemic = pandemicModule as GameModule;
const ctx = { round: 1 };

describe('Pandemic score()', () => {
  it('returns 5 when won with 4 epidemic cards (easy)', () => {
    expect(pandemic.score({ won: true, epidemics: 4 }, ctx)).toBe(5);
  });

  it('returns 6 when won with 5 epidemic cards (normal)', () => {
    expect(pandemic.score({ won: true, epidemics: 5 }, ctx)).toBe(6);
  });

  it('returns 7 when won with 6 epidemic cards (hard)', () => {
    expect(pandemic.score({ won: true, epidemics: 6 }, ctx)).toBe(7);
  });

  it('returns 0 when lost regardless of epidemic count', () => {
    expect(pandemic.score({ won: false, epidemics: 4 }, ctx)).toBe(0);
    expect(pandemic.score({ won: false, epidemics: 6 }, ctx)).toBe(0);
  });
});

describe('Pandemic metadata', () => {
  it('has scoring_mode end_of_game', () => {
    expect(pandemic.metadata.scoring_mode).toBe('end_of_game');
  });

  it('is cooperative', () => {
    expect(pandemic.metadata.cooperative).toBe(true);
  });

  it('supports 2–4 players', () => {
    expect(pandemic.metadata.min_players).toBe(2);
    expect(pandemic.metadata.max_players).toBe(4);
  });

  it('has correct bgg_id', () => {
    expect(pandemic.metadata.bgg_id).toBe(30549);
  });

  it('has cooperativo tag', () => {
    expect(pandemic.metadata.tags).toContain('cooperativo');
  });
});
