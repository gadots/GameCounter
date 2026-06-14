import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'carcassonne',
    name: 'Carcassonne',
    min_players: 2,
    max_players: 5,
    scoring_mode: 'end_of_game',
    tiebreaker_hint: 'Se comparte la victoria. House rule: gana quien tenga más meeples en granjas.',
    tags: ['estrategia', 'familia', 'losetas', 'clásico'],
    bgg_id: 822,
  },

  inputs: [
    { id: 'cities',      label: 'Ciudades',    type: 'number', min: 0, description: 'Pts de ciudades completadas (×2/loseta + ×2/escudo) e incompletas (×1 + ×1/escudo)' },
    { id: 'roads',       label: 'Caminos',     type: 'number', min: 0, description: 'Pts de caminos completos (×1/loseta) e incompletos (×1)' },
    { id: 'monasteries', label: 'Monasterios', type: 'number', min: 0, description: 'Completados: 9 pts. Incompletos: 1 pt por cada loseta circundante + el propio' },
    { id: 'farms',       label: 'Granjas',     type: 'number', min: 0, description: '+3 pts por cada ciudad completada adyacente al meeple de granja' },
  ],

  score({ cities, roads, monasteries, farms }) {
    return (
      (cities as number) +
      (roads as number) +
      (monasteries as number) +
      (farms as number)
    );
  },
} satisfies GameModule;
