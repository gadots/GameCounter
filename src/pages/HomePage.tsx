import { useNavigate } from 'react-router-dom';
import { Library, ChevronRight } from 'lucide-react';
import { sessionsStorage, playersStorage } from '../lib/storage';
import { resolvePlayerName } from '../lib/sessionEngine';
import { PageHeader } from '../components/layout/PageHeader';

export function HomePage() {
  const navigate = useNavigate();

  const players = playersStorage.getAll();
  const allSessions = sessionsStorage.getAll();
  const activeSession = allSessions.find(s => s.status === 'active') ?? null;
  const completed = allSessions
    .filter(s => s.status === 'completed')
    .sort((a, b) => new Date(b.completed_at ?? b.started_at).getTime() - new Date(a.completed_at ?? a.started_at).getTime());

  const lastSession = completed[0] ?? null;
  const lastWinnerId = lastSession?.winner_ids?.[0];
  const lastWinnerPlayer = lastWinnerId ? players.find(p => p.id === lastWinnerId) : null;
  const lastWinnerColor = lastWinnerPlayer?.color ?? '#6366f1';
  const lastWinnerName = lastSession && lastWinnerId
    ? resolvePlayerName(lastWinnerId, players, lastSession)
    : null;
  const lastDate = lastSession
    ? new Date(lastSession.completed_at ?? lastSession.started_at).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
    : null;

  const totalSessions = completed.length;
  const distinctGames = new Set(completed.map(s => s.game_id)).size;
  const hasData = totalSessions > 0 || players.length > 0;

  return (
    <div className="p-4 space-y-5">
      {/* Header */}
      <div>
        <PageHeader title="GameCounter" />
        {totalSessions > 0 && (
          <p className="text-sm text-gray-400 mt-1 pl-1">
            {totalSessions} {totalSessions === 1 ? 'partida' : 'partidas'} · {distinctGames} {distinctGames === 1 ? 'juego' : 'juegos'}
          </p>
        )}
      </div>

      {/* Empty state — solo cuando no hay nada */}
      {!hasData && (
        <div className="text-center py-10">
          <p className="text-5xl mb-3">🎲</p>
          <p className="font-semibold text-gray-700 dark:text-gray-200">¡Bienvenido!</p>
          <p className="text-sm text-gray-400 mt-1">Instalá un juego y sumá jugadores para empezar.</p>
          <button
            onClick={() => navigate('/library')}
            className="mt-4 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold active:bg-indigo-700"
          >
            Ver librería
          </button>
        </div>
      )}

      {/* Active session banner */}
      {activeSession && (
        <div
          className="rounded-2xl bg-indigo-600 text-white p-4 flex items-center gap-3 cursor-pointer active:opacity-90"
          onClick={() => navigate(`/session/${activeSession.id}`)}
        >
          <div className="flex-1">
            <p className="text-xs font-semibold opacity-70 uppercase tracking-wide">Partida en curso</p>
            <p className="font-bold text-lg leading-tight mt-0.5">{activeSession.game_name}</p>
            <p className="text-sm opacity-70 mt-0.5">
              {activeSession.player_ids
                .map(pid => players.find(p => p.id === pid)?.name ?? 'Jugador')
                .join(', ')}
            </p>
          </div>
          <div className="shrink-0 text-2xl">▶</div>
        </div>
      )}

      {/* Last session */}
      {lastSession && (
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Última partida</h2>
          <div
            className="rounded-2xl bg-white dark:bg-gray-800 shadow-sm overflow-hidden cursor-pointer active:opacity-90"
            onClick={() => navigate(`/history/${lastSession.id}`)}
          >
            <div className="h-1 w-full" style={{ backgroundColor: lastWinnerColor }} />
            <div className="flex items-center gap-3 p-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">{lastSession.game_name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {lastDate}
                  {lastWinnerName && ` · 🏆 ${lastWinnerName}`}
                </p>
              </div>
              <button
                className="shrink-0 px-3 py-1.5 rounded-xl text-sm font-semibold bg-indigo-600 text-white active:bg-indigo-700"
                onClick={e => {
                  e.stopPropagation();
                  navigate(`/session/new?game=${lastSession.game_id}&players=${lastSession.player_ids.join(',')}`);
                }}
              >
                Revancha
              </button>
            </div>
          </div>
        </section>
      )}


      {/* Library shortcut — solo cuando hay data (si no hay nada el empty state ya tiene el CTA) */}
      {hasData && (
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Juegos</h2>
          <button
            className="w-full rounded-2xl bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center gap-3 text-left active:opacity-80"
            onClick={() => navigate('/library')}
          >
            <Library size={20} className="text-indigo-500 shrink-0" />
            <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-100">Librería de juegos</span>
            <ChevronRight size={16} className="text-gray-300 dark:text-gray-600" />
          </button>
        </section>
      )}
    </div>
  );
}
