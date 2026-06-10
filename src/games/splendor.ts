import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'splendor',
    name: 'Splendor',
    min_players: 2,
    max_players: 4,
    scoring_mode: 'end_of_game',
    target_score: 15,
    tiebreaker_hint: 'Gana quien tenga menos cartas de desarrollo. Si hay empate, quien tenga menos nobles.',
    tags: ['gemas', 'cartas', 'estrategia'],
    bgg_id: 148228,
  },

  inputs: [
    { id: 'card_points', label: 'Puntos de cartas', type: 'stepper', min: 0, description: 'Puntos de prestigio de tus cartas de desarrollo' },
    { id: 'nobles_count', label: 'Nobles', type: 'stepper', min: 0, max: 5, description: 'Cantidad de nobles visitantes (×3 puntos c/u)' },
  ],

  score({ card_points, nobles_count }) {
    return (card_points as number) + (nobles_count as number) * 3;
  },
} satisfies GameModule;
