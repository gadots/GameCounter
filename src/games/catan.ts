import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'catan',
    name: 'Catan',
    min_players: 3,
    max_players: 4,
    scoring_mode: 'end_of_game',
    target_score: 10,
    tiebreaker_hint: 'Oficialmente se comparte la victoria. House rule: gana quien más caminos construyó.',
    tags: ['estrategia', 'familia', 'intercambio', 'clásico'],
    bgg_id: 13,
  },

  inputs: [
    { id: 'settlements',  label: 'Asentamientos',          type: 'stepper', min: 0, max: 5, description: '1 VP cada uno' },
    { id: 'cities',       label: 'Ciudades',                type: 'stepper', min: 0, max: 4, description: '2 VP cada una' },
    { id: 'longest_road', label: 'Camino más largo',        type: 'toggle',  description: '+2 VP. Solo un jugador puede tenerlo.' },
    { id: 'largest_army', label: 'Ejército más grande',     type: 'toggle',  description: '+2 VP. Solo un jugador puede tenerlo.' },
    { id: 'vp_cards',     label: 'Cartas de Punto de Victoria', type: 'stepper', min: 0, max: 5, description: '1 VP cada una' },
  ],

  score({ settlements, cities, longest_road, largest_army, vp_cards }) {
    return (
      (settlements as number) * 1 +
      (cities as number) * 2 +
      (longest_road ? 2 : 0) +
      (largest_army ? 2 : 0) +
      (vp_cards as number) * 1
    );
  },
} satisfies GameModule;
