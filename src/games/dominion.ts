import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'dominion',
    name: 'Dominion',
    min_players: 2,
    max_players: 4,
    scoring_mode: 'end_of_game',
    tiebreaker_hint: 'Gana quien terminó su turno más recientemente en caso de empate.',
    tags: ['deck-building', 'cartas', 'estrategia', 'clásico'],
    bgg_id: 36218,
  },

  inputs: [
    { id: 'estates',    label: 'Fincas',                type: 'stepper', min: 0, description: '+1 VP cada una' },
    { id: 'duchies',    label: 'Ducados',               type: 'stepper', min: 0, description: '+3 VP cada uno' },
    { id: 'provinces',  label: 'Provincias',            type: 'stepper', min: 0, description: '+6 VP cada una' },
    { id: 'colonies',   label: 'Colonias',              type: 'stepper', min: 0, description: '+10 VP cada una (expansión Prosperity)' },
    { id: 'kingdom_vp', label: 'VP de cartas de reino', type: 'number',  min: 0, description: 'Jardines (1VP c/10 cartas en mazo), Duque, Isla y otras cartas con VP del reino activo' },
    { id: 'curses',     label: 'Maldiciones',           type: 'stepper', min: 0, description: '−1 VP cada una' },
  ],

  score({ estates, duchies, provinces, colonies, kingdom_vp, curses }) {
    return (
      (estates as number) +
      (duchies as number) * 3 +
      (provinces as number) * 6 +
      (colonies as number) * 10 +
      (kingdom_vp as number) -
      (curses as number)
    );
  },
} satisfies GameModule;
