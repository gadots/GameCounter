import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'codenames',
    name: 'Codenames',
    min_players: 4,
    max_players: 8,
    scoring_mode: 'per_round',
    tiebreaker_hint: 'Gana el equipo que descubra todos sus agentes primero.',
    tags: ['palabras', 'equipos', 'party', 'deducción'],
    bgg_id: 178900,
  },

  inputs: [
    { id: 'words_found', label: 'Agentes descubiertos', type: 'stepper', min: 0, max: 9, description: 'Palabras de tu color encontradas correctamente en esta ronda' },
    { id: 'assassin',   label: 'Tocó al asesino',      type: 'toggle',               description: '-5 puntos si tu equipo tocó la carta del asesino' },
  ],

  score({ words_found, assassin }) {
    return (words_found as number) - (assassin ? 5 : 0);
  },
} satisfies GameModule;
