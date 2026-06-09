import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { sessionsStorage, playersStorage } from '../lib/storage';
import { resolvePlayerName } from '../lib/sessionEngine';
import { Card } from '../components/ui/Card';

type SortOrder = 'desc' | 'asc';

const selectClass =
  'rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-3 py-2.5 text-sm w-full';

export function HistoryPage() {
  const [searchParams] = useSearchParams();
  const [filterPlayer, setFilterPlayer] = useState(searchParams.get('player') ?? '');
  const [filterGame, setFilterGame] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const navigate = useNavigate();

  const allSessions = sessionsStorage.getAll().filter(s => s.status === 'completed');
  const players = playersStorage.getAll();
  const gameNames = [...new Set(allSessions.map(s => s.game_name))].sort();

  const filtered = allSessions
    .filter(s => !filterPlayer || s.player_ids.includes(filterPlayer))
    .filter(s => !filterGame || s.game_name === filterGame)
    .sort((a, b) => {
      const diff =
        new Date(b.completed_at ?? b.started_at).getTime() -
        new Date(a.completed_at ?? a.started_at).getTime();
      return sortOrder === 'desc' ? diff : -diff;
    });

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Historial</h1>

      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <select value={filterPlayer} onChange={e => setFilterPlayer(e.target.value)} className={selectClass}>
            <option value="">Todos los jugadores</option>
            {players.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <select value={filterGame} onChange={e => setFilterGame(e.target.value)} className={selectClass}>
            <option value="">Todos los juegos</option>
            {gameNames.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <select value={sortOrder} onChange={e => setSortOrder(e.target.value as SortOrder)} className={selectClass}>
          <option value="desc">Más recientes primero</option>
          <option value="asc">Más antiguas primero</option>
        </select>
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-400 py-12">No hay partidas completadas.</p>
      )}

      <div className="space-y-3">
        {filtered.map(session => {
          const winners = (session.winner_ids ?? []).map(id => resolvePlayerName(id, players, session));
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
                    {session.player_ids.map(id => resolvePlayerName(id, players, session)).join(', ')}
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
