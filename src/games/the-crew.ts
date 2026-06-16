import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'the-crew', name: 'The Crew',
    min_players: 2, max_players: 5,
    scoring_mode: 'per_round',
    cooperative: true,
    tiebreaker_hint: 'Juego cooperativo de misiones — todos ganan o pierden cada misión juntos.',
    tags: ['cooperativo', 'cartas', 'deducción', 'misiones'],
    bgg_id: 284083,
  },
  inputs: [
    { id: 'completed', label: '¿Misión completada?', type: 'toggle',
      description: '+1 punto si todos superaron la misión. Usen una ronda por misión.' },
    { id: 'mission', label: 'N° de misión', type: 'stepper', min: 1, max: 50, default: 1,
      description: 'Número de misión del libro de aventuras (1–50 en la versión base, 1–32 en The Crew 2).' },
  ],
  score({ completed }) { return completed ? 1 : 0; },
} satisfies GameModule;
