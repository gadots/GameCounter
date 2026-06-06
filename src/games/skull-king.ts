import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'skull-king',
    name: 'Skull King',
    min_players: 2,
    max_players: 6,
    scoring_mode: 'per_round',
    total_rounds: 10,
    tiebreaker_hint: 'Gana quien tenga mayor puntaje en la última ronda.',
    tags: ['cartas', 'apuestas', 'familia', 'piratas'],
    bgg_id: 180891,
  },

  inputs: [
    { id: 'bid',        label: 'Basas apostadas',      type: 'stepper', min: 0, description: 'Cuántas basas prometiste ganar' },
    { id: 'won',        label: 'Basas ganadas',        type: 'stepper', min: 0, description: 'Cuántas basas ganaste realmente' },
    { id: 'skull_king', label: 'Skull King capturado', type: 'toggle',  description: '+30 puntos si capturaste al Skull King con una Sirena' },
    { id: 'mermaids',   label: 'Sirenas capturadas',   type: 'stepper', min: 0, max: 2, description: '+20 por cada Sirena capturada con el Skull King' },
    { id: 'pirates',    label: 'Piratas capturados',   type: 'stepper', min: 0, max: 5, description: '+30 por cada Pirata capturado con el Skull King' },
    { id: 'flag_14s',   label: 'Banderas 14 capturadas', type: 'stepper', min: 0, max: 2, description: '+20 por cada bandera 14 (Tigre/Kraken) capturada' },
  ],

  score({ bid, won, skull_king, mermaids, pirates, flag_14s }, { round }) {
    const b = bid as number;
    const w = won as number;

    if (b === 0) {
      return w === 0 ? round * 10 : -(round * 10);
    }

    if (b === w) {
      const bonus =
        (skull_king ? 30 : 0) +
        (mermaids as number) * 20 +
        (pirates as number) * 30 +
        (flag_14s as number) * 20;
      return b * 20 + bonus;
    }

    return -(Math.abs(b - w) * 10);
  },

  validate({ bid, won }) {
    const b = bid as number;
    const w = won as number;
    if (b < 0 || w < 0) return 'Los valores no pueden ser negativos.';
    return null;
  },
} satisfies GameModule;
