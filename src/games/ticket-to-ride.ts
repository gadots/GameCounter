import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'ticket-to-ride',
    name: 'Ticket to Ride',
    min_players: 2,
    max_players: 5,
    scoring_mode: 'end_of_game',
    tiebreaker_hint: 'Gana quien completó más tickets de destino.',
    tags: ['trenes', 'rutas', 'familia'],
    bgg_id: 9209,
  },

  inputs: [
    { id: 'route_points', label: 'Puntos de rutas', type: 'number', min: 0, description: 'Suma de puntos de todas tus rutas reclamadas' },
    { id: 'tickets_bonus', label: 'Tickets completados', type: 'number', min: 0, description: 'Suma de puntos de tickets de destino completados' },
    { id: 'tickets_penalty', label: 'Tickets fallidos', type: 'number', min: 0, description: 'Suma de puntos de tickets NO completados (se restan)' },
    { id: 'longest_route', label: 'Ruta más larga', type: 'toggle', description: 'Bonus de 10 puntos por tener la ruta continua más larga' },
  ],

  score({ route_points, tickets_bonus, tickets_penalty, longest_route }) {
    return (route_points as number) + (tickets_bonus as number) - (tickets_penalty as number) + (longest_route ? 10 : 0);
  },
} satisfies GameModule;
