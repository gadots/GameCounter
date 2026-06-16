import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'small-world', name: 'Small World',
    min_players: 2, max_players: 5,
    scoring_mode: 'end_of_game',
    tiebreaker_hint: 'En caso de empate, gana quien perdió la última batalla.',
    tags: ['estrategia', 'fantasy', 'control', 'área'],
    bgg_id: 40692,
  },
  inputs: [
    { id: 'coins', label: 'Monedas de victoria acumuladas', type: 'number', min: 0,
      description: 'Total de monedas de victoria recibidas durante toda la partida (una por región controlada por turno)' },
  ],
  score({ coins }) { return coins as number; },
} satisfies GameModule;
