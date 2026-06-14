import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'hanabi',
    name: 'Hanabi',
    min_players: 2,
    max_players: 5,
    scoring_mode: 'end_of_game',
    target_score: 25,
    tiebreaker_hint: 'Puntaje compartido: todos ganan o pierden igual. Meta legendaria: 25 puntos.',
    tags: ['cooperativo', 'cartas', 'deducción', 'comunicación'],
    bgg_id: 98778,
  },

  inputs: [
    { id: 'fireworks', label: 'Puntaje de fuegos artificiales', type: 'stepper', min: 0, max: 25, description: 'Suma de la carta más alta completada en cada color (máx 5 por color × 5 colores = 25)' },
  ],

  score({ fireworks }) {
    return fireworks as number;
  },
} satisfies GameModule;
