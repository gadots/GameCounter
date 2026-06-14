import type { GameModule } from '../lib/types';

function tableVP(n: number, thresholds: [number, number][]): number {
  for (const [min, vp] of [...thresholds].reverse()) {
    if (n >= min) return vp;
  }
  return -1;
}

export default {
  metadata: {
    id: 'agricola',
    name: 'Agrícola',
    min_players: 1,
    max_players: 5,
    scoring_mode: 'end_of_game',
    tiebreaker_hint: 'Gana quien tenga más comida sobrante; luego más animales.',
    tags: ['estrategia', 'euro', 'granja', 'avanzado'],
    bgg_id: 31260,
  },

  inputs: [
    { id: 'fields',         label: 'Campos (cant.)',           type: 'stepper', min: 0, max: 9,  description: '0=−1 / 1=0 / 2=+1 / 3=+2 / 4=+3 / 5+=+4' },
    { id: 'pastures',       label: 'Pastos vallados (cant.)', type: 'stepper', min: 0, max: 8,  description: '0=−1 / 1=+1 / 2=+2 / 3=+3 / 4+=+4' },
    { id: 'grain',          label: 'Granos en reserva',       type: 'stepper', min: 0, description: '0=−1 / 1–3=+1 / 4–5=+2 / 6–7=+3 / 8+=+4' },
    { id: 'vegetables',     label: 'Vegetales en reserva',    type: 'stepper', min: 0, description: '0=−1 / 1=+1 / 2–3=+2 / 4+=+3' },
    { id: 'sheep',          label: 'Ovejas',                  type: 'stepper', min: 0, description: '0=−1 / 1–3=+1 / 4–5=+2 / 6–7=+3 / 8+=+4' },
    { id: 'pigs',           label: 'Jabalíes',                type: 'stepper', min: 0, description: '0=−1 / 1–2=+1 / 3–4=+2 / 5–6=+3 / 7+=+4' },
    { id: 'cattle',         label: 'Ganado',                  type: 'stepper', min: 0, description: '0=−1 / 1=+1 / 2–3=+2 / 4–5=+3 / 6+=+4' },
    { id: 'unused_spaces',  label: 'Espacios sin usar',       type: 'stepper', min: 0, max: 15, description: '−1 VP por espacio vacío en el tablero de granja' },
    { id: 'stables',        label: 'Establos',                type: 'stepper', min: 0, max: 4,  description: '+1 VP por establo construido' },
    { id: 'house_type',     label: 'Tipo de cabaña',          type: 'select',
      options: ['Madera (−1/hab)', 'Barro (0/hab)', 'Piedra (+1/hab)'],
      description: 'Todos empiezan con madera. Barro y piedra se construyen durante la partida.' },
    { id: 'room_count',     label: 'Habitaciones',            type: 'stepper', min: 2, max: 5, default: 2, description: 'Cantidad de habitaciones de tu cabaña al final' },
    { id: 'family_members', label: 'Miembros de familia',     type: 'stepper', min: 2, max: 5, default: 2, description: '+3 VP por cada miembro' },
    { id: 'bonus_cards',    label: 'Cartas y mejoras (pts)', type: 'number',  description: 'Suma de puntos de Ocupaciones y Mejoras de hogar' },
  ],

  score({ fields, pastures, grain, vegetables, sheep, pigs, cattle, unused_spaces, stables, house_type, room_count, family_members, bonus_cards }) {
    const fieldVP:    [number, number][] = [[1, 0], [2, 1], [3, 2], [4, 3], [5, 4]];
    const pastureVP:  [number, number][] = [[1, 1], [2, 2], [3, 3], [4, 4]];
    const grainVP:    [number, number][] = [[1, 1], [4, 2], [6, 3], [8, 4]];
    const vegVP:      [number, number][] = [[1, 1], [2, 2], [4, 3]];
    const sheepVP:    [number, number][] = [[1, 1], [4, 2], [6, 3], [8, 4]];
    const pigVP:      [number, number][] = [[1, 1], [3, 2], [5, 3], [7, 4]];
    const cattleVP:   [number, number][] = [[1, 1], [2, 2], [4, 3], [6, 4]];
    const houseVPPerRoom = [-1, 0, 1][house_type as number];

    return (
      tableVP(fields as number, fieldVP) +
      tableVP(pastures as number, pastureVP) +
      tableVP(grain as number, grainVP) +
      tableVP(vegetables as number, vegVP) +
      tableVP(sheep as number, sheepVP) +
      tableVP(pigs as number, pigVP) +
      tableVP(cattle as number, cattleVP) +
      -(unused_spaces as number) +
      (stables as number) +
      (room_count as number) * houseVPPerRoom +
      (family_members as number) * 3 +
      (bonus_cards as number)
    );
  },
} satisfies GameModule;
