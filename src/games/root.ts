import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'root',
    name: 'Root',
    min_players: 2,
    max_players: 4,
    scoring_mode: 'end_of_game',
    target_score: 30,
    tiebreaker_hint: 'La partida termina en cuanto alguien llega a 30 PV. En dominación por coalición, gana el jugador apoyado.',
    tags: ['estrategia', 'asimétrico', 'guerra', 'bosque'],
    bgg_id: 237182,
  },

  inputs: [
    { id: 'vp', label: 'Puntos de Victoria', type: 'number', min: 0, description: 'Puntos acumulados al final de la partida' },
  ],

  score({ vp }) {
    return vp as number;
  },
} satisfies GameModule;
