import { InputRenderer, Card } from 'gamecounter-scaffold';

const roundInputs = [
  { id: 'bid', label: 'Basas apostadas', type: 'stepper' as const, min: 0, description: 'Cuántas basas prometiste ganar' },
  { id: 'won', label: 'Basas ganadas', type: 'stepper' as const, min: 0, description: 'Cuántas basas ganaste realmente' },
  { id: 'skull_king', label: 'Skull King capturado', type: 'toggle' as const, description: '+40 si lo capturaste con tu Sirena' },
];

export const RoundEntry = () => (
  <div style={{ maxWidth: 380 }}>
    <Card>
      <InputRenderer
        inputs={roundInputs}
        values={{ bid: 2, won: 3, skull_king: true }}
        onChange={() => {}}
      />
    </Card>
  </div>
);

const mixedInputs = [
  { id: 'players', label: 'Cantidad de jugadores', type: 'select' as const, options: ['2', '3', '4', '5', '6'] },
  { id: 'score', label: 'Puntaje final', type: 'number' as const, min: 0 },
  { id: 'won_game', label: '¿Ganó la partida?', type: 'toggle' as const },
];

export const AllFieldTypes = () => (
  <div style={{ maxWidth: 380 }}>
    <Card>
      <InputRenderer
        inputs={mixedInputs}
        values={{ players: 2, score: 42, won_game: false }}
        onChange={() => {}}
      />
    </Card>
  </div>
);
