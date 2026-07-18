import { Card, Button } from 'gamecounter-scaffold';

export const Basic = () => (
  <div style={{ maxWidth: 360 }}>
    <Card>
      <h3 className="text-base font-semibold text-gray-900 dark:text-white">Catan</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">3–4 jugadores · 60–90 min</p>
    </Card>
  </div>
);

export const WithActions = () => (
  <div style={{ maxWidth: 360 }}>
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 dark:text-white">Partida en curso</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Skull King · ronda 4 de 10</p>
        </div>
        <Button size="sm">Continuar</Button>
      </div>
    </Card>
  </div>
);

export const NoPadding = () => (
  <div style={{ maxWidth: 360 }}>
    <Card padding={false}>
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 font-semibold text-gray-900 dark:text-white">
        Puntajes acumulados
      </div>
      <ul className="divide-y divide-gray-100 dark:divide-gray-700">
        <li className="px-4 py-2.5 flex justify-between text-sm text-gray-700 dark:text-gray-200">
          <span>👑 Jose</span><span className="font-bold text-gray-900 dark:text-white">160</span>
        </li>
        <li className="px-4 py-2.5 flex justify-between text-sm text-gray-700 dark:text-gray-200">
          <span>Pepe</span><span className="font-bold text-gray-900 dark:text-white">60</span>
        </li>
      </ul>
    </Card>
  </div>
);
