import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'seven-wonders-duel', name: '7 Wonders Duel',
    min_players: 2, max_players: 2,
    scoring_mode: 'end_of_game',
    tiebreaker_hint: 'Gana quien tenga más monedas. Atención: hay victorias inmediatas por supremacía militar o científica — terminá la sesión manualmente si ocurre.',
    tags: ['estrategia', 'civilización', 'cartas', '2 jugadores'],
    bgg_id: 173346,
  },
  inputs: [
    { id: 'civilian',  label: 'Cartas civiles (azules)',   type: 'stepper', min: 0, description: 'VP impreso en las cartas azules' },
    { id: 'science',   label: 'Ciencia (verdes)',          type: 'stepper', min: 0, description: 'Cada par de símbolos iguales = +9 VP. Si tenés los 7 símbolos distintos = +10 VP adicionales' },
    { id: 'commerce',  label: 'Comercio y gremios',        type: 'stepper', min: 0, description: 'VP de cartas amarillas y moradas con VP condicionales (ya calculados)' },
    { id: 'wonders',   label: 'Maravillas',                type: 'stepper', min: 0, description: 'VP impreso en las maravillas construidas' },
    { id: 'military',  label: 'Tokens de victoria militar', type: 'stepper', min: 0, description: 'Suma de los VP de los tokens de victoria obtenidos en conflictos militares' },
    { id: 'progress',  label: 'Tokens de progreso',        type: 'stepper', min: 0, description: 'VP de tokens de progreso (Agricultura: +6, Arquitectura, etc.)' },
    { id: 'treasury',  label: 'Tesoro (monedas)',          type: 'number',  min: 0, description: 'Monedas al final → ÷3 redondeado hacia abajo = VP' },
  ],
  score({ civilian, science, commerce, wonders, military, progress, treasury }) {
    return (
      (civilian as number) +
      (science as number) +
      (commerce as number) +
      (wonders as number) +
      (military as number) +
      (progress as number) +
      Math.floor((treasury as number) / 3)
    );
  },
} satisfies GameModule;
