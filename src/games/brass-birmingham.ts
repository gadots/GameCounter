import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'brass-birmingham', name: 'Brass: Birmingham',
    min_players: 2, max_players: 4,
    scoring_mode: 'end_of_game',
    tiebreaker_hint: 'Gana quien tenga más ingresos al final; luego más carbón en la red.',
    tags: ['estrategia', 'económico', 'industrial', 'avanzado'],
    bgg_id: 224517,
  },
  inputs: [
    { id: 'canal_vp', label: 'VP era Canal',          type: 'number', min: 0,
      description: 'VP totales de la era Canal: puntos de losetas de industria volcadas + puntos de enlaces construidos + bonos de mercaderes' },
    { id: 'rail_vp',  label: 'VP era Ferrocarril',    type: 'number', min: 0,
      description: 'VP totales de la era Ferrocarril: misma lógica que la era Canal pero con mayor valor de enlaces' },
  ],
  score({ canal_vp, rail_vp }) {
    return (canal_vp as number) + (rail_vp as number);
  },
} satisfies GameModule;
