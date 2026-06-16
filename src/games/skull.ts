import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'skull',
    name: 'Skull',
    min_players: 3,
    max_players: 6,
    scoring_mode: 'per_round',
    target_score: 2,
    tiebreaker_hint: 'El primero en ganar 2 apuestas exitosas gana la partida.',
    tags: ['bluff', 'party', 'apuestas', 'rápido'],
    bgg_id: 122522,
  },

  inputs: [
    {
      id: 'won',
      label: '¿Ganaste la apuesta?',
      type: 'toggle',
      description: '+1 medallón por apuesta ganada exitosamente. Meta: 2 medallones.',
    },
  ],

  score({ won }) {
    return won ? 1 : 0;
  },
} satisfies GameModule;
