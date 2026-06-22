import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'exploding-kittens',
    name: 'Exploding Kittens',
    min_players: 2,
    max_players: 5,
    scoring_mode: 'per_round',
    tiebreaker_hint: 'El jugador con más rondas ganadas gana la sesión.',
    tags: ['cartas', 'familia', 'party', 'azar'],
    bgg_id: 172225,
  },

  inputs: [
    { id: 'won', label: '¿Ganó esta ronda?', type: 'toggle', exclusive_group: 'ek_winner', description: 'El único sobreviviente obtiene 1 punto. Los demás obtienen 0.' },
  ],

  score({ won }) {
    return won ? 1 : 0;
  },
} satisfies GameModule;
