import { describe, it, expect } from 'vitest';
import type { GameModule } from '../../lib/types';
import wingspanModule from '../wingspan';

const wingspan = wingspanModule as GameModule;
const ctx = { round: 1 };

const zero = { birds: 0, eggs: 0, food: 0, tucked: 0, round_goals: 0, bonus_card: 0, nectar: 0 };

describe('Wingspan score()', () => {
  it('returns 0 for all-zero inputs', () => {
    expect(wingspan.score(zero, ctx)).toBe(0);
  });

  it('counts bird VP directly', () => {
    expect(wingspan.score({ ...zero, birds: 15 }, ctx)).toBe(15);
  });

  it('adds 1 VP per egg', () => {
    expect(wingspan.score({ ...zero, eggs: 8 }, ctx)).toBe(8);
  });

  it('adds 1 VP per food token on birds', () => {
    expect(wingspan.score({ ...zero, food: 5 }, ctx)).toBe(5);
  });

  it('adds 1 VP per tucked card', () => {
    expect(wingspan.score({ ...zero, tucked: 4 }, ctx)).toBe(4);
  });

  it('adds round goal VP', () => {
    expect(wingspan.score({ ...zero, round_goals: 11 }, ctx)).toBe(11);
  });

  it('adds bonus card VP', () => {
    expect(wingspan.score({ ...zero, bonus_card: 10 }, ctx)).toBe(10);
  });

  it('adds nectar VP (Asia expansion)', () => {
    expect(wingspan.score({ ...zero, nectar: 3 }, ctx)).toBe(3);
  });

  it('computes typical game score correctly', () => {
    // birds=37, eggs=12, food=5, tucked=4, round_goals=11, bonus_card=10, nectar=0 = 79
    expect(wingspan.score({ birds: 37, eggs: 12, food: 5, tucked: 4, round_goals: 11, bonus_card: 10, nectar: 0 }, ctx)).toBe(79);
  });
});

describe('Wingspan metadata', () => {
  it('has scoring_mode end_of_game', () => {
    expect(wingspan.metadata.scoring_mode).toBe('end_of_game');
  });

  it('supports 1–5 players', () => {
    expect(wingspan.metadata.min_players).toBe(1);
    expect(wingspan.metadata.max_players).toBe(5);
  });
});
