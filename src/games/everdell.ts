import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'everdell', name: 'Everdell',
    min_players: 1, max_players: 4,
    scoring_mode: 'end_of_game',
    tiebreaker_hint: 'Gana quien tenga más recursos sobrantes; luego más cartas en mano.',
    tags: ['otoño', 'construcción', 'euro', 'trabajadores'],
    bgg_id: 199792,
  },
  inputs: [
    { id: 'city_vp',   label: 'VP de cartas en la ciudad',  type: 'number',  min: 0,
      description: 'Suma de los puntos impresos en cada carta jugada en tu ciudad (edificios, criaturas, eventos especiales)' },
    { id: 'events',    label: 'Eventos e hitos',             type: 'stepper', min: 0,
      description: 'Puntos de Eventos básicos (3 VP c/u) + VP de cualquier Hito especial completado' },
    { id: 'journey',   label: 'Puntos de travesía',          type: 'stepper', min: 0,
      description: 'VP ganados al enviar trabajadores en travesía al final de la partida' },
    { id: 'leftovers', label: 'Recursos sobrantes (cartas que puntúan)', type: 'stepper', min: 0,
      description: 'Algunos edificios dan +1 VP por cada recurso sobrante al final; sumá esos VP aquí' },
  ],
  score({ city_vp, events, journey, leftovers }) {
    return (
      (city_vp as number) +
      (events as number) +
      (journey as number) +
      (leftovers as number)
    );
  },
} satisfies GameModule;
