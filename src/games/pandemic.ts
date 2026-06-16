import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'pandemic',
    name: 'Pandemic',
    min_players: 2,
    max_players: 4,
    scoring_mode: 'end_of_game',
    cooperative: true,
    tiebreaker_hint: 'Juego cooperativo — todos ganan o todos pierden. Sin desempate individual.',
    tags: ['cooperativo', 'estrategia', 'salud', 'temático'],
    bgg_id: 30549,
  },

  inputs: [
    {
      id: 'won',
      label: '¿Ganaron la partida?',
      type: 'toggle',
      description: 'Ganan si curan las 4 enfermedades. Pierden si se acaban las cartas de jugador, los cubos de enfermedad, o hay 8 brotes.',
    },
    {
      id: 'epidemics',
      label: 'Cartas de Epidemia usadas',
      type: 'stepper',
      min: 4,
      max: 6,
      default: 4,
      description: '4 = fácil, 5 = normal, 6 = difícil. Suma dificultad al puntaje de victoria.',
    },
  ],

  score({ won, epidemics }) {
    return won ? 1 + (epidemics as number) : 0;
  },
} satisfies GameModule;
