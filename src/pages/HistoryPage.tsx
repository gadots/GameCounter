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
    period: '',
  });

  const allSessions = sessionsStorage.getAll().filter(s => s.status === 'completed');
  const players = playersStorage.getAll();
  const gameNames = [...new Set(allSessions.map(s => s.game_name))].sort();

  const periodStart = (() => {
    const d = new Date();
    if (filters.period === 'week') { d.setDate(d.getDate() - 7); d.setHours(0, 0, 0, 0); return d; }
    if (filters.period === 'month') { d.setDate(1); d.setHours(0, 0, 0, 0); return d; }
    if (filters.period === 'year') { d.setMonth(0, 1); d.setHours(0, 0, 0, 0); return d; }
    return null;
  })();

  const filtered = allSessions
    .filter(s => !filters.player || s.player_ids.includes(filters.player))
    .filter(s => !filters.game || s.game_name === filters.game)
    .filter(s => !periodStart || new Date(s.completed_at ?? s.started_at) >= periodStart)
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
                {/* Header row */}
                <p className="font-semibold text-gray-900 dark:text-gray-100">{session.game_name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                  {totalRounds > 1 && ` · ${totalRounds} rondas`}
                </p>

                {/* Player chips */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {session.player_ids.map(pid => {
                    const p = players.find(pl => pl.id === pid);
                    const pColor = p?.color ?? '#6366f1';
                    const isWinner = winners.includes(pid);
                    const name = resolvePlayerName(pid, players, session);
                    return (
                      <div
                        key={pid}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          isWinner
                            ? ''
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}
                        style={isWinner ? {
                          backgroundColor: pColor + '30',
                          color: pColor,
                          boxShadow: `inset 0 0 0 1px ${pColor}55`,
                        } : {}}
                      >
                        <span className="text-sm leading-none">{p?.avatar_emoji ?? '🎲'}</span>
                        <span className="max-w-[72px] truncate">{name}</span>
                        {isWinner && <span className="text-xs leading-none">🏆</span>}
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
