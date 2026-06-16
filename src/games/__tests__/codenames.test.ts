import { describe, it, expect } from 'vitest';
import type { GameModule } from '../../lib/types';
import codenamesModule from '../codenames';

const codenames = codenamesModule as GameModule;
const ctx = { round: 1 };

describe('Codenames score()', () => {
  it('returns words_found when no assassin', () => {
    expect(codenames.score({ words_found: 8, assassin: false }, ctx)).toBe(8);
  });

  it('subtracts 5 when assassin is true', () => {
    expect(codenames.score({ words_found: 8, assassin: true }, ctx)).toBe(3);
  });

  it('returns 0 with zero words and no assassin', () => {
    expect(codenames.score({ words_found: 0, assassin: false }, ctx)).toBe(0);
  });

  it('returns -5 with zero words and assassin hit', () => {
    expect(codenames.score({ words_found: 0, assassin: true }, ctx)).toBe(-5);
  });

  it('returns exact words_found without penalty for false assassin', () => {
    expect(codenames.score({ words_found: 9, assassin: false }, ctx)).toBe(9);
  });

  it('handles small word count with assassin penalty', () => {
    expect(codenames.score({ words_found: 2, assassin: true }, ctx)).toBe(-3);
  });
});
