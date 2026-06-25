import type { GameModule, InputDef, InputValues } from '../lib/types';

const completeInputs: InputDef[] = [
  { id: 'bid',          label: 'Basas apostadas',        type: 'stepper', min: 0, description: 'Cuántas basas prometiste ganar esta ronda' },
  { id: 'won',          label: 'Basas ganadas',          type: 'stepper', min: 0, description: 'Cuántas basas ganaste realmente' },
  { id: 'skull_king',   label: 'Skull King capturado',   type: 'toggle',  description: '+40 puntos si capturaste al Skull King con tu Sirena' },
  { id: 'pirates',      label: 'Piratas capturados',     type: 'stepper', min: 0, max: 5, description: '+30 por cada Pirata capturado por tu Skull King' },
  { id: 'standard_14s', label: '14 de color capturados', type: 'stepper', min: 0, max: 3, description: '+10 por cada carta 14 de color (verde, amarillo o morado) capturada en una basa ganada' },
  { id: 'black_14',     label: '14 negro (Jolly Roger)', type: 'toggle',  description: '+20 si capturaste el 14 negro en una basa ganada' },
  { id: 'loot',         label: 'Cartas de botín',        type: 'stepper', min: 0, max: 2, description: '+20 por cada carta de botín capturada (requiere haber cumplido la apuesta)' },
];

const advancedInputs: InputDef[] = [
  { id: 'bid',        label: 'Basas apostadas',      type: 'stepper', min: 0, description: 'Cuántas basas prometiste ganar esta ronda' },
  { id: 'won',        label: 'Basas ganadas',        type: 'stepper', min: 0, description: 'Cuántas basas ganaste realmente' },
  { id: 'skull_king', label: 'Skull King capturado', type: 'toggle',  description: '+40 puntos si capturaste al Skull King con tu Sirena' },
  { id: 'pirates',    label: 'Piratas capturados',   type: 'stepper', min: 0, max: 5, description: '+30 por cada Pirata capturado por tu Skull King' },
];

const standardInputs: InputDef[] = [
  { id: 'bid', label: 'Basas apostadas', type: 'stepper', min: 0, description: 'Cuántas basas prometiste ganar esta ronda' },
  { id: 'won', label: 'Basas ganadas',   type: 'stepper', min: 0, description: 'Cuántas basas ganaste realmente' },
];

export default {
  metadata: {
    id: 'skull-king',
    name: 'Skull King',
    min_players: 2,
    max_players: 6,
    scoring_mode: 'per_round',
    total_rounds: 10,
    tiebreaker_hint: 'Gana quien tenga mayor puntaje acumulado al final de la ronda 10.',
    tags: ['cartas', 'apuestas', 'familia', 'piratas'],
    bgg_id: 180891,
    modes: [
      { id: 'complete',  name: 'Completo',  description: 'Reglas 2021 — Skull King, Piratas, cartas 14 (color +10, negro +20) y Botín' },
      { id: 'advanced',  name: 'Avanzado',  description: 'Con Skull King y Piratas capturados, sin cartas 14 ni Botín' },
      { id: 'standard',  name: 'Clásico',   description: 'Solo apuestas y basas ganadas, sin bonos de cartas especiales' },
    ],
    default_mode: 'complete',
  },

  inputs: completeInputs,

  getInputs(mode_id: string): InputDef[] {
    if (mode_id === 'standard') return standardInputs;
    if (mode_id === 'advanced') return advancedInputs;
    return completeInputs;
  },

  score({ bid, won, skull_king, pirates, standard_14s, black_14, loot }: InputValues, { round, mode_id }) {
    const b = bid as number;
    const w = won as number;

    if (b === 0) {
      return w === 0 ? round * 10 : -(round * 10);
    }

    if (b === w) {
      let bonus = 0;
      if (mode_id !== 'standard') {
        bonus += skull_king ? 40 : 0;
        bonus += (pirates as number || 0) * 30;
      }
      if (mode_id === 'complete' || mode_id === undefined || mode_id === null) {
        bonus += (standard_14s as number || 0) * 10;
        bonus += black_14 ? 20 : 0;
        bonus += (loot as number || 0) * 20;
      }
      return b * 20 + bonus;
    }

    return -(Math.abs(b - w) * 10);
  },

  validate({ bid, won }: InputValues) {
    const b = bid as number;
    const w = won as number;
    if (b < 0 || w < 0) return 'Los valores no pueden ser negativos.';
    return null;
  },
} satisfies GameModule;
