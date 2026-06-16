import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'viticulture', name: 'Viticulture',
    min_players: 2, max_players: 6,
    scoring_mode: 'end_of_game',
    target_score: 20,
    tiebreaker_hint: 'Gana quien quedó primero en el track de VP; luego quien tenga más liras.',
    tags: ['vino', 'euro', 'trabajadores', 'estrategia'],
    bgg_id: 128621,
  },
  inputs: [
    { id: 'vp', label: 'Puntos de victoria', type: 'number', min: 0,
      description: 'Posición final en el track de VP. La partida termina cuando alguien llega a 20 VP al final de un año.' },
  ],
  score({ vp }) { return vp as number; },
} satisfies GameModule;
