import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'seven-wonders',
    name: '7 Wonders',
    min_players: 2,
    max_players: 7,
    scoring_mode: 'end_of_game',
    tiebreaker_hint: 'Gana quien más monedas tenga en el tesoro.',
    tags: ['estrategia', 'civilización', 'cartas', 'simultáneo'],
    bgg_id: 68448,
  },

  inputs: [
    { id: 'military',  label: 'Conflictos militares', type: 'number', description: 'Puede ser negativo por derrotas (-1 por era)' },
    { id: 'treasury',  label: 'Tesoro',               type: 'stepper', min: 0, description: '1 punto por cada 3 monedas' },
    { id: 'wonders',   label: 'Maravillas',            type: 'stepper', min: 0, max: 4, description: 'Puntos de etapas construidas de la maravilla' },
    { id: 'civilian',  label: 'Edificios civiles',     type: 'stepper', min: 0, description: 'Puntos de cartas azules' },
    { id: 'commerce',  label: 'Comercio',              type: 'stepper', min: 0, description: 'Puntos de cartas amarillas' },
    { id: 'guilds',    label: 'Gremios',               type: 'stepper', min: 0, description: 'Puntos de cartas moradas' },
    { id: 'science',   label: 'Ciencia',               type: 'stepper', min: 0, description: 'Puntos de cartas verdes (símbolos + juegos de 3)' },
  ],

  score({ military, treasury, wonders, civilian, commerce, guilds, science }) {
    return (
      (military as number) +
      Math.floor((treasury as number) / 3) +
      (wonders as number) +
      (civilian as number) +
      (commerce as number) +
      (guilds as number) +
      (science as number)
    );
  },
} satisfies GameModule;
