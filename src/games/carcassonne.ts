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
    { id: 'cities',      label: 'Ciudades',      type: 'number', min: 0, description: 'Puntos totales de ciudades completadas e incompletas' },
    { id: 'roads',       label: 'Caminos',       type: 'number', min: 0, description: 'Puntos totales de caminos completos e incompletos' },
    { id: 'monasteries', label: 'Monasterios',   type: 'number', min: 0, description: 'Puntos totales de monasterios (completados ×9, incompletos ×losetas)' },
    { id: 'farms',       label: 'Granjas',       type: 'number', min: 0, description: '+3 puntos por ciudad completada adyacente al meeple de granja' },
    { id: 'pennants',    label: 'Escudos',       type: 'stepper', min: 0, description: '+2 VP extra por escudo en ciudad completada (ya incluidos arriba si se prefiere)' },
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
