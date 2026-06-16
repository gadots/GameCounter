import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'puerto-rico', name: 'Puerto Rico',
    min_players: 2, max_players: 5,
    scoring_mode: 'end_of_game',
    tiebreaker_hint: 'Gana quien tenga más doblones; luego más mercancías en los barcos.',
    tags: ['euro', 'clásico', 'estrategia', 'rol'],
    bgg_id: 3076,
  },
  inputs: [
    { id: 'ship_vp',       label: 'Puntos de barcos',   type: 'stepper', min: 0,
      description: 'VP de barriles embarcados durante toda la partida en la fase del Capitán' },
    { id: 'building_vp',   label: 'Puntos de edificios', type: 'number',  min: 0,
      description: 'Suma de VP de los edificios en tu ciudad (valor impreso; los edificios grandes dan más si están completos)' },
    { id: 'large_building', label: 'Gran edificio (bonus)', type: 'stepper', min: 0, max: 4,
      description: 'VP adicionales del gran edificio completado: Gremio (+1 VP por edificio de producción), Residencia (+4–5 VP), etc.' },
  ],
  score({ ship_vp, building_vp, large_building }) {
    return (
      (ship_vp as number) +
      (building_vp as number) +
      (large_building as number)
    );
  },
} satisfies GameModule;
