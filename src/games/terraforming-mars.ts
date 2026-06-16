import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'terraforming-mars', name: 'Terraforming Mars',
    min_players: 1, max_players: 5,
    scoring_mode: 'end_of_game',
    tiebreaker_hint: 'Gana quien tenga más MegaCréditos; luego quien avanzó más el último.',
    tags: ['estrategia', 'ciencia ficción', 'motor', 'euro', 'avanzado'],
    bgg_id: 167791,
  },
  inputs: [
    { id: 'tr',          label: 'TR (Terraform Rating)',       type: 'number',  min: 20,
      description: 'Tu calificación de terraformación final. Empieza en 20 y sube con cada parámetro global que subís.' },
    { id: 'greenery',    label: 'Verdor (losetas colocadas)',  type: 'stepper', min: 0,
      description: '+1 VP por cada loseta de verdor que colocaste' },
    { id: 'city',        label: 'Ciudades (VP de adyacencia)', type: 'stepper', min: 0,
      description: '+1 VP por cada loseta de verdor adyacente a cada una de tus ciudades' },
    { id: 'milestones',  label: 'Hitos logrados',              type: 'stepper', min: 0, max: 3,
      description: '+5 VP por cada hito alcanzado (máx 3 en la partida)' },
    { id: 'awards_1st',  label: 'Premios (1° lugar)',          type: 'stepper', min: 0, max: 3,
      description: '+5 VP por cada premio ganado en primer lugar' },
    { id: 'awards_2nd',  label: 'Premios (2° lugar)',          type: 'stepper', min: 0, max: 3,
      description: '+2 VP por cada premio en el que quedaste segundo' },
    { id: 'card_vp',     label: 'VP de cartas jugadas',        type: 'number',  min: 0,
      description: 'Suma de todos los iconos de VP en tus cartas jugadas al final de la partida' },
  ],
  score({ tr, greenery, city, milestones, awards_1st, awards_2nd, card_vp }) {
    return (
      (tr as number) +
      (greenery as number) +
      (city as number) +
      (milestones as number) * 5 +
      (awards_1st as number) * 5 +
      (awards_2nd as number) * 2 +
      (card_vp as number)
    );
  },
} satisfies GameModule;
