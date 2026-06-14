import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { sessionsStorage, playersStorage } from '../lib/storage';
import { resolvePlayerName } from '../lib/sessionEngine';
import { HistoryFilters, type FilterState } from '../components/HistoryFilters';
import { PageHeader } from '../components/layout/PageHeader';
import type { Session, Player } from '../lib/types';

function winnerColor(session: Session, players: Player[]): string {
  const winnerId = session.winner_ids?.[0];
  if (!winnerId) return '#6366f1';
  return players.find(p => p.id === winnerId)?.color ?? '#6366f1';
}

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
      <PageHeader title="Historial" />

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
          const color = winnerColor(session, players);
          const winners = session.winner_ids ?? [];
          const isTie = winners.length > 1;
          const date = new Date(session.completed_at ?? session.started_at);
          const totalRounds = Math.max(...session.scores.map(s => s.round), 0);

          return (
            <div
              key={session.id}
              className="rounded-2xl bg-white dark:bg-gray-800 overflow-hidden cursor-pointer shadow-sm hover:shadow-md active:scale-[0.99] transition-all"
              onClick={() => navigate(`/history/${session.id}`)}
            >
              <div className="h-1 w-full" style={{ backgroundColor: color }} />
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{session.game_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {totalRounds > 1 && ` · ${totalRounds} rondas`}
                    </p>
                  </div>
                  {isTie && <span className="text-sm shrink-0">🤝</span>}
                </div>
                <div className="flex items-center gap-1.5 mt-3">
                  {session.player_ids.map(pid => {
                    const p = players.find(pl => pl.id === pid);
                    const isWinner = winners.includes(pid);
                    return (
                      <div
                        key={pid}
                        className={`w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all ${isWinner ? 'ring-2' : ''}`}
                        style={{
                          backgroundColor: (p?.color ?? '#6366f1') + '22',
                          boxShadow: isWinner ? `0 0 0 2px ${color}` : undefined,
                        }}
                        title={resolvePlayerName(pid, players, session)}
                      >
                        {p?.avatar_emoji ?? '🎲'}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
