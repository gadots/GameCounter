import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'exploding-kittens',
    name: 'Exploding Kittens',
    min_players: 2,
    max_players: 5,
    scoring_mode: 'end_of_game',
    tiebreaker_hint: 'No hay empate posible: solo sobrevive un jugador.',
    tags: ['cartas', 'familia', 'party', 'azar'],
    bgg_id: 172225,
  },

  inputs: [
    { id: 'survived', label: '¿Sobrevivió?', type: 'toggle', description: 'El único sobreviviente gana la ronda' },
    { id: 'position', label: 'Posición de eliminación', type: 'stepper', min: 1, description: 'Turno en que fue eliminado (el sobreviviente deja este en 0)' },
  ],

  score({ survived, position }) {
    if (survived) return 100;
    const pos = position as number;
    return pos > 0 ? pos * 5 : 0;
  },
} satisfies GameModule;
