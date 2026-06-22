import type { GameModule, InputDef } from '../lib/types';

const standardInputs: InputDef[] = [
  { id: 'fireworks', label: 'Puntaje de fuegos artificiales', type: 'stepper', min: 0, max: 25, description: 'Suma de la carta más alta completada en cada color (máx 5 por color × 5 colores = 25)' },
];

const multicolorInputs: InputDef[] = [
  { id: 'fireworks', label: 'Puntaje de fuegos artificiales', type: 'stepper', min: 0, max: 30, description: 'Con la 6ª pila multicolor: máx 5 por color × 6 colores = 30' },
];

export default {
  metadata: {
    id: 'hanabi',
    name: 'Hanabi',
    min_players: 2,
    max_players: 5,
    scoring_mode: 'end_of_game',
    target_score: 25,
    cooperative: true,
    tiebreaker_hint: 'Puntaje compartido: todos ganan o pierden igual. Meta legendaria: 25 (o 30 con multicolor).',
    tags: ['cooperativo', 'cartas', 'deducción', 'comunicación'],
    bgg_id: 98778,
    modes: [
      { id: 'standard', name: 'Clásico', description: '5 colores — puntaje máximo 25' },
      { id: 'multicolor', name: 'Multicolor', description: '6ª pila multicolor (arcoíris) — puntaje máximo 30' },
    ],
    default_mode: 'standard',
  },

  inputs: standardInputs,

  getInputs(mode_id: string): InputDef[] {
    return mode_id === 'multicolor' ? multicolorInputs : standardInputs;
  },

  score({ fireworks }) {
    return fireworks as number;
  },
} satisfies GameModule;
