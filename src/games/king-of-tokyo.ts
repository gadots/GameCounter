import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'king-of-tokyo',
    name: 'King of Tokyo',
    min_players: 2,
    max_players: 6,
    scoring_mode: 'per_round',
    target_score: 20,
    tiebreaker_hint: 'También gana quien elimina a todos los demás monstruos.',
    tags: ['dados', 'monstruos', 'familiar', 'battle'],
    bgg_id: 70323,
  },

  inputs: [
    {
      id: 'vp',
      label: 'Puntos de victoria esta ronda',
      type: 'stepper',
      min: 0,
      description: 'Puntos ganados con dados (⚡ relámpagos no cuentan), cartas y bonificaciones.',
    },
  ],

  score({ vp }) {
    return vp as number;
  },
} satisfies GameModule;
