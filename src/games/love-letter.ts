import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'love-letter',
    name: 'Love Letter',
    min_players: 2,
    max_players: 6,
    scoring_mode: 'per_round',
    tiebreaker_hint: 'Gana quien primero alcance la meta de tokens (2j→7, 3j→5, 4j+→4). Desempate: carta de mayor valor.',
    tags: ['cartas', 'deducción', 'familia', 'rápido'],
    bgg_id: 129622,
  },

  inputs: [
    { id: 'won', label: '¿Ganó esta sub-ronda?', type: 'toggle', description: '+1 token de afecto. Primero en llegar a la meta gana la partida (2j→7, 3j→5, 4j+→4).' },
  ],

  score({ won }) {
    return won ? 1 : 0;
  },
} satisfies GameModule;
