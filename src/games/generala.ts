import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'generala', name: 'Generala',
    min_players: 2, max_players: 8,
    scoring_mode: 'end_of_game',
    tiebreaker_hint: 'Gana quien anotó Generala; si ninguno o varios, quien tenga mayor puntaje total.',
    tags: ['dados', 'familia', 'clásico', 'argentina'],
  },
  inputs: [
    // Upper section (ones through sixes)
    { id: 'ones',   label: 'Unos',    type: 'stepper', min: 0, max: 5, description: 'Cantidad de dados con valor 1 (puntaje = cantidad × 1)' },
    { id: 'twos',   label: 'Doses',   type: 'stepper', min: 0, max: 5, description: 'Cantidad de dados con valor 2 (puntaje = cantidad × 2)' },
    { id: 'threes', label: 'Treses',  type: 'stepper', min: 0, max: 5, description: 'Cantidad de dados con valor 3 (puntaje = cantidad × 3)' },
    { id: 'fours',  label: 'Cuatros', type: 'stepper', min: 0, max: 5, description: 'Cantidad de dados con valor 4 (puntaje = cantidad × 4)' },
    { id: 'fives',  label: 'Cincos',  type: 'stepper', min: 0, max: 5, description: 'Cantidad de dados con valor 5 (puntaje = cantidad × 5)' },
    { id: 'sixes',  label: 'Seises',  type: 'stepper', min: 0, max: 5, description: 'Cantidad de dados con valor 6 (puntaje = cantidad × 6)' },
    // Lower section (fixed values)
    { id: 'escalera', label: 'Escalera', type: 'toggle', description: '+20 puntos (1-2-3-4-5 ó 2-3-4-5-6)' },
    { id: 'full',     label: 'Full',     type: 'toggle', description: '+30 puntos (trío + par)' },
    { id: 'poker',    label: 'Póker',    type: 'toggle', description: '+40 puntos (cuatro dados iguales)' },
    { id: 'generala', label: 'Generala', type: 'toggle', description: '+50 puntos (cinco dados iguales)' },
    { id: 'extra',    label: 'Bonos extra', type: 'number', default: 0,
      description: 'Generala doble (+100), Generala servida (doble el valor), u otros bonos de la variante que estén jugando' },
  ],
  score({ ones, twos, threes, fours, fives, sixes, escalera, full, poker, generala: gen, extra }) {
    const upper =
      (ones as number) * 1 +
      (twos as number) * 2 +
      (threes as number) * 3 +
      (fours as number) * 4 +
      (fives as number) * 5 +
      (sixes as number) * 6;
    const lower =
      (escalera ? 20 : 0) +
      (full ? 30 : 0) +
      (poker ? 40 : 0) +
      (gen ? 50 : 0) +
      (extra as number);
    return upper + lower;
  },
} satisfies GameModule;
