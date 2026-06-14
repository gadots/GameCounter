import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'azul',
    name: 'Azul',
    min_players: 2,
    max_players: 4,
    scoring_mode: 'per_round',
    tiebreaker_hint: 'Gana quien tenga más filas horizontales completas; luego más columnas; luego más colores completos.',
    tags: ['estrategia', 'abstracto', 'familia', 'puzzle'],
    bgg_id: 230802,
  },

  inputs: [
    { id: 'placed',   label: 'Puntos por azulejos',   type: 'number', min: 0, description: 'Puntos ganados por azulejos colocados en el muro este turno' },
    { id: 'floor',    label: 'Penalización fila suelo', type: 'stepper', min: 0, max: 7, description: 'Fichas en la fila del suelo (resta: -1,-1,-2,-2,-2,-3,-3)' },
  ],

  score({ placed, floor }) {
    const penalties = [0, -1, -2, -4, -6, -8, -11, -14];
    const f = Math.min(floor as number, 7);
    return (placed as number) + penalties[f];
  },
} satisfies GameModule;
