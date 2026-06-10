import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { sessionsStorage, playersStorage } from '../lib/storage';
import { resolvePlayerName } from '../lib/sessionEngine';
import { Card } from '../components/ui/Card';
import { HistoryFilters, type FilterState } from '../components/HistoryFilters';

export function HistoryPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [filters, setFilters] = useState<FilterState>({
    player: searchParams.get('player') ?? '',
    game: '',
    sort: 'desc',
  });

  const allSessions = sessionsStorage.getAll().filter(s => s.status === 'completed');
  const players = playersStorage.getAll();
  const gameNames = [...new Set(allSessions.map(s => s.game_name))].sort();

  const filtered = allSessions
    .filter(s => !filters.player || s.player_ids.includes(filters.player))
    .filter(s => !filters.game || s.game_name === filters.game)
    .sort((a, b) => {
      const diff =
        new Date(b.completed_at ?? b.started_at).getTime() -
        new Date(a.completed_at ?? a.started_at).getTime();
      return filters.sort === 'desc' ? diff : -diff;
    });

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Historial</h1>

      <HistoryFilters
        players={players}
        gameNames={gameNames}
        value={filters}
        onChange={setFilters}
      />

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
