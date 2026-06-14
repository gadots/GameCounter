import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'scrabble',
    name: 'Scrabble',
    min_players: 2,
    max_players: 4,
    scoring_mode: 'per_round',
    tiebreaker_hint: 'Al terminar, se restan los puntos de las fichas que quedan en mano.',
    tags: ['palabras', 'familia', 'clásico', 'abstracto'],
    bgg_id: 320,
  },

  inputs: [
    { id: 'word_score', label: 'Puntos de la jugada', type: 'number', min: 0, description: 'Suma del valor de las fichas colocadas, multiplicadores incluidos' },
  ],

  score({ word_score }) {
    return word_score as number;
  },
} satisfies GameModule;
