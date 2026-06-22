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
    { id: 'treasury',  label: 'Tesoro (monedas)',      type: 'number',  min: 0, description: 'Ingresá tu cantidad de monedas — la app calcula los VP (÷3, redondeado hacia abajo)' },
    { id: 'wonders',   label: 'Maravillas',            type: 'stepper', min: 0, description: 'Puntos de victoria de las etapas construidas de tu maravilla (algunas dan 3/5/7 VP)' },
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
