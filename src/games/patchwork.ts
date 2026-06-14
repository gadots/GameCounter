import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'patchwork',
    name: 'Patchwork',
    min_players: 2,
    max_players: 2,
    scoring_mode: 'end_of_game',
    tiebreaker_hint: 'Gana quien haya avanzado más lejos en el track de tiempo.',
    tags: ['estrategia', 'puzzle', '2 jugadores', 'abstracto'],
    bgg_id: 163412,
  },

  inputs: [
    { id: 'buttons', label: 'Botones', type: 'stepper', min: 0, description: '+1 punto por botón' },
    { id: 'empty_spaces', label: 'Espacios vacíos', type: 'stepper', min: 0, max: 81, description: '-2 puntos por cada espacio vacío en tu tablero 9×9' },
    { id: 'special_tile', label: 'Loseta especial 7×7', type: 'toggle', exclusive_group: 'pw_tile7x7', description: '+7 puntos si eres el primero en completar un cuadrado 7×7' },
  ],

  score({ buttons, empty_spaces, special_tile }) {
    return (
      (buttons as number) -
      (empty_spaces as number) * 2 +
      (special_tile ? 7 : 0)
    );
  },
} satisfies GameModule;
