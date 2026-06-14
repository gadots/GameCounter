import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'love-letter',
    name: 'Love Letter',
    min_players: 2,
    max_players: 6,
    scoring_mode: 'per_round',
    tiebreaker_hint: 'Gana quien gane el duelo con la carta de mayor valor.',
    tags: ['cartas', 'deducción', 'family', 'rápido'],
    bgg_id: 129622,
  },

  inputs: [
    { id: 'tokens', label: 'Tokens de afecto ganados', type: 'stepper', min: 0, description: '1 token por cada ronda ganada. Primero en llegar a meta gana (4p→4t, 3p→5t, 2p→7t)' },
  ],

  score({ tokens }) {
    return tokens as number;
  },
} satisfies GameModule;
