import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'kingdomino',
    name: 'Kingdomino',
    min_players: 2,
    max_players: 4,
    scoring_mode: 'end_of_game',
    tiebreaker_hint: 'Gana quien tenga el domino más valorado; luego quien más coronas tenga.',
    tags: ['losetas', 'familia', 'rápido', 'construcción'],
    bgg_id: 204583,
  },

  inputs: [
    {
      id: 'score',
      label: 'Puntaje total',
      type: 'number',
      min: 0,
      description: 'Suma (tamaño de región × coronas en esa región) para cada región. Añadí +10 si el castillo está centrado en el tablero 5×5.',
    },
  ],

  score({ score }) {
    return score as number;
  },
} satisfies GameModule;
