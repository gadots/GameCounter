import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'uno',
    name: 'UNO',
    min_players: 2,
    max_players: 10,
    scoring_mode: 'per_round',
    target_score: 500,
    tiebreaker_hint: 'Gana el primero en llegar a 500 puntos acumulados.',
    tags: ['cartas', 'familiar', 'clásico'],
  },

  inputs: [
    {
      id: 'points_earned',
      label: 'Puntos ganados',
      type: 'number',
      min: 0,
      description: 'Si ganaste la ronda: suma el valor de las cartas de todos los demás. Si no ganaste: dejá en 0.',
    },
  ],

  score({ points_earned }) {
    return points_earned as number;
  },
} satisfies GameModule;
