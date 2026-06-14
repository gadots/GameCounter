import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'sushi-go',
    name: 'Sushi Go!',
    min_players: 2,
    max_players: 5,
    scoring_mode: 'per_round',
    total_rounds: 3,
    tiebreaker_hint: 'Gana quien tenga más cartas de pudín al final de los 3 turnos.',
    tags: ['cartas', 'familia', 'rápido', 'drafting'],
    bgg_id: 133473,
  },

  inputs: [
    { id: 'tempura',   label: 'Tempura',   type: 'stepper', min: 0, description: 'Pares de Tempura: cada par vale 5 pts' },
    { id: 'sashimi',   label: 'Sashimi',   type: 'stepper', min: 0, description: 'Tríos de Sashimi: cada trío vale 10 pts' },
    { id: 'dumplings', label: 'Dumplings', type: 'stepper', min: 0, max: 5, description: '1/3/6/10/15 pts por 1/2/3/4/5+ dumplings' },
    { id: 'nigiri',    label: 'Nigiri',    type: 'number',  min: 0, description: 'Puntos directos de nigiris (×1/×2/×3, wasabi aplicado)' },
    { id: 'maki', label: 'Makis', type: 'select',
      options: ['Sin puntos (0)', 'Segundo lugar (3 pts)', 'Primer lugar (6 pts)'],
      description: 'Quién tiene más makis al final de la ronda. Empate: se divide y redondea hacia abajo.' },
  ],

  score({ tempura, sashimi, dumplings, nigiri, maki }) {
    const dumpVP = [0, 1, 3, 6, 10, 15];
    const makiVP = [0, 3, 6];
    const d = Math.min(dumplings as number, 5);
    return (
      Math.floor((tempura as number) / 2) * 5 +
      Math.floor((sashimi as number) / 3) * 10 +
      dumpVP[d] +
      (nigiri as number) +
      makiVP[maki as number]
    );
  },
} satisfies GameModule;
