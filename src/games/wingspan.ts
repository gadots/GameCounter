import type { GameModule } from '../lib/types';

export default {
  metadata: {
    id: 'wingspan', name: 'Wingspan',
    min_players: 1, max_players: 5,
    scoring_mode: 'end_of_game',
    tiebreaker_hint: 'Gana quien tenga más huevos; luego más alimentos en aves; luego más cartas bajo aves.',
    tags: ['aves', 'motor', 'naturaleza', 'euro'],
    bgg_id: 266192,
  },
  inputs: [
    { id: 'birds',       label: 'VP de aves (impreso en cartas)', type: 'number',  min: 0,
      description: 'Suma de los puntos de victoria impresos en cada carta de ave jugada en tu tapete' },
    { id: 'eggs',        label: 'Huevos en aves',                 type: 'stepper', min: 0,
      description: '+1 VP por cada huevo sobre aves al final de la partida' },
    { id: 'food',        label: 'Alimentos en aves',              type: 'stepper', min: 0,
      description: '+1 VP por cada token de alimento guardado bajo aves (capacidad de almacenamiento)' },
    { id: 'tucked',      label: 'Cartas bajo aves',               type: 'stepper', min: 0,
      description: '+1 VP por cada carta guardada bajo aves (algunas aves lo hacen automáticamente)' },
    { id: 'round_goals', label: 'Objetivos de ronda',             type: 'stepper', min: 0,
      description: 'Suma de VP de los 4 objetivos de ronda (según posición: 1°=5VP, 2°=2VP, 3°=1VP, 4°=0VP aprox.)' },
    { id: 'bonus_card',  label: 'Carta de bonificación',          type: 'stepper', min: 0,
      description: 'VP de tu carta de bonificación personal (condición específica × VP por carta)' },
    { id: 'nectar',      label: 'Néctar (exp. Asia)',             type: 'stepper', min: 0,
      description: 'VP de tokens de néctar si juegan con la expansión Asia. Ignorar si no usan la expansión.' },
  ],
  score({ birds, eggs, food, tucked, round_goals, bonus_card, nectar }) {
    return (
      (birds as number) +
      (eggs as number) +
      (food as number) +
      (tucked as number) +
      (round_goals as number) +
      (bonus_card as number) +
      (nectar as number)
    );
  },
} satisfies GameModule;
