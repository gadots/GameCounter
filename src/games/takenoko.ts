import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'takenoko', name: 'Takenoko',
    min_players: 2, max_players: 4,
    scoring_mode: 'end_of_game',
    tiebreaker_hint: 'Gana quien completó más objetivos del Emperador (tipo Panda); luego quien haya tomado el 1° turno.',
    tags: ['familia', 'losetas', 'panda', 'puzzle'],
    bgg_id: 70919,
  },
  inputs: [
    { id: 'plot_pts',    label: 'Objetivos de parcela',     type: 'number',  min: 0,
      description: 'Suma de VP de las cartas de objetivo de parcela completadas (2–3 pts c/u)' },
    { id: 'garden_pts',  label: 'Objetivos del jardinero',  type: 'number',  min: 0,
      description: 'Suma de VP de las cartas de objetivo del jardinero completadas (4–8 pts c/u)' },
    { id: 'panda_pts',   label: 'Objetivos del panda',      type: 'number',  min: 0,
      description: 'Suma de VP de las cartas de objetivo del panda completadas (2–3 pts c/u)' },
    { id: 'emperor',     label: 'Sello del Emperador',      type: 'toggle', exclusive_group: 'takenoko_emperor',
      description: '+2 VP al primer jugador en completar un objetivo de cada tipo (parcela + jardinero + panda). Solo un jugador puede tenerlo.' },
  ],
  score({ plot_pts, garden_pts, panda_pts, emperor }) {
    return (
      (plot_pts as number) +
      (garden_pts as number) +
      (panda_pts as number) +
      (emperor ? 2 : 0)
    );
  },
} satisfies GameModule;
