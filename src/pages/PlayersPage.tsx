import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayers } from '../hooks/usePlayers';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/layout/PageHeader';

export function PlayersPage() {
  const { players, addPlayer } = usePlayers();
  const navigate = useNavigate();
  const [name, setName] = useState('');

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    addPlayer(trimmed);
    setName('');
  };

  return (
    <div className="p-4 space-y-4">
      <PageHeader title="Jugadores" />

      <Card>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nombre del jugador"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-3 py-2 text-sm"
          />
          <Button onClick={handleAdd} disabled={!name.trim()}>
            Agregar
          </Button>
        </div>
      </Card>

      {players.length === 0 && (
        <p className="text-center text-gray-400 py-12">No hay jugadores todavía.</p>
      )}

      <div className="space-y-2">
        {players.map(player => (
          <Card
            key={player.id}
            className="flex items-center gap-3 cursor-pointer hover:ring-2 hover:ring-indigo-200 dark:hover:ring-indigo-700 transition-all"
            onClick={() => navigate(`/players/${player.id}`)}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0"
              style={{ backgroundColor: player.color + '33' }}
            >
              {player.avatar_emoji}
            </div>
            <p className="flex-1 font-medium text-gray-800 dark:text-gray-100">{player.name}</p>
            <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Card>
        ))}
      </div>
    </div>
  );
}
