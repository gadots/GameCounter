import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sessionsStorage, playersStorage } from '../lib/storage';
import { Card } from '../components/ui/Card';

export function HistoryPage() {
  const [filterPlayer, setFilterPlayer] = useState('');
  const navigate = useNavigate();

  const sessions = sessionsStorage.getAll()
    .filter(s => s.status === 'completed')
    .sort((a, b) => new Date(b.completed_at ?? b.started_at).getTime() - new Date(a.completed_at ?? a.started_at).getTime());

  const players = playersStorage.getAll();

  const filtered = filterPlayer
    ? sessions.filter(s => s.player_ids.includes(filterPlayer))
    : sessions;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Historial</h1>

      <select
        value={filterPlayer}
        onChange={e => setFilterPlayer(e.target.value)}
        className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-4 py-2.5 text-sm"
      >
        <option value="">Todos los jugadores</option>
        {players.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 py-12">No hay partidas completadas.</p>
      )}

      <div className="space-y-3">
        {filtered.map(session => {
          const winners = (session.winner_ids ?? []).map(id => players.find(p => p.id === id)?.name ?? 'Desconocido');
          const date = new Date(session.completed_at ?? session.started_at);
          const totalRounds = Math.max(...session.scores.map(s => s.round), 0);

          return (
            <Card
              key={session.id}
              className="cursor-pointer hover:ring-2 hover:ring-indigo-200 dark:hover:ring-indigo-700 transition-all"
              onClick={() => navigate(`/history/${session.id}`)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{session.game_name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    {totalRounds > 1 && ` · ${totalRounds} rondas`}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {session.player_ids.map(id => players.find(p => p.id === id)?.name ?? id).join(', ')}
                  </p>
                </div>
                {winners.length > 0 && (
                  <div className="text-right shrink-0 ml-2">
                    <span className="text-base">🏆</span>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-200">{winners.join(', ')}</p>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
