import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'coup',
    name: 'Coup',
    min_players: 2,
    max_players: 6,
    scoring_mode: 'per_round',
    tiebreaker_hint: 'Gana quien acumuló más partidas ganadas.',
    tags: ['bluff', 'social', 'party', 'deducción'],
    bgg_id: 131357,
  },

  inputs: [
    {
      id: 'won',
      label: '¿Ganaste esta partida?',
      type: 'toggle',
      exclusive_group: 'coup_winner',
      description: '+1 punto por partida ganada. Solo un jugador gana cada ronda. Jugá múltiples rondas para comparar victorias.',
    },
  ],

  score({ won }) {
    return won ? 1 : 0;
  },
} satisfies GameModule;
