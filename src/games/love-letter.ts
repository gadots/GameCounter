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
    { id: 'won', label: '¿Ganó esta sub-ronda?', type: 'toggle', exclusive_group: 'love_letter_winner', description: '+1 token de afecto. Solo un jugador gana cada sub-ronda. Primero en llegar a la meta gana la partida (2j→7, 3j→5, 4j+→4).' },
  ],

  score({ won }) {
    return won ? 1 : 0;
  },
} satisfies GameModule;
