import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'sagrada', name: 'Sagrada',
    min_players: 1, max_players: 4,
    scoring_mode: 'end_of_game',
    tiebreaker_hint: 'Gana quien tenga más fichas de favor; luego quien tenga mayor objetivo privado.',
    tags: ['dados', 'puzzle', 'familia', 'abstracto'],
    bgg_id: 199561,
  },
  inputs: [
    { id: 'private_obj',  label: 'Objetivo privado',    type: 'number',  min: 0,
      description: 'Suma de los valores de los dados del color de tu objetivo privado en la diagonal o posición indicada' },
    { id: 'public_obj',   label: 'Objetivos públicos',  type: 'number',  min: 0,
      description: 'Suma de los VP de los 3 objetivos públicos compartidos (calculá tu propio puntaje en cada uno)' },
    { id: 'favor_tokens', label: 'Fichas de favor',     type: 'stepper', min: 0,
      description: '+1 VP por cada ficha de favor no gastada al final' },
    { id: 'empty_spaces', label: 'Ventanas vacías',     type: 'stepper', min: 0, max: 20,
      description: '−1 VP por cada espacio vacío en tu vitral (máx 20 sin dados)' },
  ],
  score({ private_obj, public_obj, favor_tokens, empty_spaces }) {
    return (
      (private_obj as number) +
      (public_obj as number) +
      (favor_tokens as number) -
      (empty_spaces as number)
    );
  },
} satisfies GameModule;
