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
    { id: 'placed', label: 'Puntos por azulejos',    type: 'number', min: 0, description: 'Puntos ganados por azulejos colocados en el muro este turno' },
    { id: 'floor',  label: 'Penalización fila suelo', type: 'stepper', min: 0, max: 7, description: 'Fichas en la fila del suelo (penalización: 0/-1/-2/-4/-6/-8/-11/-14)' },
  ],

  score({ placed, floor }) {
    const penalties = [0, -1, -2, -4, -6, -8, -11, -14];
    return (placed as number) + penalties[Math.min(floor as number, 7)];
  },

  final_round: {
    label: 'Bonificaciones finales',
    inputs: [
      { id: 'rows',    label: 'Filas horizontales completas',  type: 'stepper', min: 0, max: 5, description: '+2 puntos por cada fila de 5 azulejos completa en el muro' },
      { id: 'columns', label: 'Columnas verticales completas', type: 'stepper', min: 0, max: 5, description: '+7 puntos por cada columna de 5 azulejos completa en el muro' },
      { id: 'colors',  label: 'Colores completos',             type: 'stepper', min: 0, max: 5, description: '+10 puntos por cada color del que tenés los 5 azulejos colocados' },
    ],
    score({ rows, columns, colors }) {
      return (rows as number) * 2 + (columns as number) * 7 + (colors as number) * 10;
    },
  },
} satisfies GameModule;
