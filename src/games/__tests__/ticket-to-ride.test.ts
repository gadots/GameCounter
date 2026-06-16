import { describe, it, expect } from 'vitest';
import type { GameModule } from '../../lib/types';
import ttrModule from '../ticket-to-ride';

const ttr = ttrModule as GameModule;
const ctx = { round: 1 };

describe('Ticket to Ride score()', () => {
  it('returns route_points when nothing else applies', () => {
    expect(ttr.score({ route_points: 30, tickets_bonus: 0, tickets_penalty: 0, longest_route: false }, ctx)).toBe(30);
  });

  it('adds tickets_bonus to route_points', () => {
    expect(ttr.score({ route_points: 30, tickets_bonus: 20, tickets_penalty: 0, longest_route: false }, ctx)).toBe(50);
  });

  it('subtracts tickets_penalty', () => {
    expect(ttr.score({ route_points: 40, tickets_bonus: 0, tickets_penalty: 15, longest_route: false }, ctx)).toBe(25);
  });

  it('adds 10 for longest_route bonus', () => {
    expect(ttr.score({ route_points: 0, tickets_bonus: 0, tickets_penalty: 0, longest_route: true }, ctx)).toBe(10);
  });

  it('computes a full realistic score', () => {
    // 55 + 22 - 8 + 10 = 79
    expect(ttr.score({ route_points: 55, tickets_bonus: 22, tickets_penalty: 8, longest_route: true }, ctx)).toBe(79);
  });

  it('returns 0 for all zeros', () => {
    expect(ttr.score({ route_points: 0, tickets_bonus: 0, tickets_penalty: 0, longest_route: false }, ctx)).toBe(0);
  });
});

describe('Ticket to Ride metadata', () => {
  it('has end_of_game scoring mode', () => {
    expect(ttr.metadata.scoring_mode).toBe('end_of_game');
  });

  it('longest_route input has exclusive_group ttr_route', () => {
    const longestRouteInput = ttr.inputs.find(i => i.id === 'longest_route');
    expect(longestRouteInput?.exclusive_group).toBe('ttr_route');
  });
});
