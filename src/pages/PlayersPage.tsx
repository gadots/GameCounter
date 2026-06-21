import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayers } from '../hooks/usePlayers';
import { useSessions } from '../hooks/useSession';
import { computeEloRatings } from '../lib/sessionEngine';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { PageHeader } from '../components/layout/PageHeader';
import { UserPlus } from 'lucide-react';

export function PlayersPage() {
  const { players, addPlayer } = usePlayers();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [tab, setTab] = useState<'list' | 'metrics'>('list');
  const [metricsView, setMetricsView] = useState<'elo' | 'wins'>('elo');
  const [showEloInfo, setShowEloInfo] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'recent' | 'games'>('name');

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    addPlayer(trimmed);
    setName('');
    setShowAddModal(false);
  };

  const handleCloseAddModal = () => {
    setName('');
    setShowAddModal(false);
  };

  const allSessions = useSessions();

  const gameCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allSessions.filter(s => s.status === 'completed').forEach(s => {
      s.player_ids.forEach(pid => { counts[pid] = (counts[pid] ?? 0) + 1; });
    });
    return counts;
  }, [allSessions]);

  const visiblePlayers = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = q ? players.filter(p => p.name.toLowerCase().includes(q)) : players;
    if (sortBy === 'name') return filtered; // already alphabetical from usePlayers
    if (sortBy === 'recent') return [...filtered].sort((a, b) => b.created_at.localeCompare(a.created_at));
    return [...filtered].sort((a, b) => (gameCounts[b.id] ?? 0) - (gameCounts[a.id] ?? 0));
  }, [players, search, sortBy, gameCounts]);

  const { byElo, byWins } = useMemo(() => {
    const completed = allSessions.filter(s => s.status === 'completed');
    const eloRatings = computeEloRatings(allSessions);

    const metrics = players
      .map(p => {
        const mySessions = completed.filter(s => s.player_ids.includes(p.id));
        const wins = mySessions.filter(s => s.winner_ids?.includes(p.id)).length;
        const gameCounts = mySessions.reduce((acc, s) => {
          acc[s.game_name] = (acc[s.game_name] ?? 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const topGame = Object.entries(gameCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
        const elo = eloRatings[p.id] ?? 1000;
        return {
          player: p,
          sessions: mySessions.length,
          wins,
          winRate: mySessions.length > 0 ? Math.round((wins / mySessions.length) * 100) : 0,
          topGame,
          elo,
        };
      })
      .filter(m => m.sessions > 0);

    return {
      byElo: [...metrics].sort((a, b) => b.elo - a.elo || b.wins - a.wins),
      byWins: [...metrics].sort((a, b) => b.wins - a.wins || b.winRate - a.winRate),
    };
  }, [allSessions, players]);

  const metrics = byElo;

  return (
    <div className="p-4 space-y-4">
      <PageHeader title="Jugadores" />

      {/* Tabs */}
      <div className="flex gap-2">
        {(['list', 'metrics'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            {t === 'list' ? 'Jugadores' : 'Métricas'}
          </button>
        ))}
      </div>

      {tab === 'list' && (
        <>
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-500 dark:text-gray-400 hover:border-indigo-400 hover:text-indigo-500 dark:hover:border-indigo-500 dark:hover:text-indigo-400 transition-colors"
          >
            <UserPlus size={16} />
            Agregar jugador
          </button>

          {players.length === 0 && (
            <p className="text-center text-gray-400 py-12">No hay jugadores todavía.</p>
          )}

          {players.length > 4 && (
            <div className="space-y-2">
              <input
                type="search"
                aria-label="Buscar jugador"
                placeholder="Buscar jugador..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 px-4 py-2.5 text-sm"
              />
              <div className="flex gap-2">
                {(['name', 'recent', 'games'] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setSortBy(s)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      sortBy === s
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300'
                    }`}
                  >
                    {s === 'name' ? 'A–Z' : s === 'recent' ? 'Recientes' : 'Más partidas'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {players.length > 0 && visiblePlayers.length === 0 && (
            <p className="text-center text-gray-400 py-12">No se encontraron jugadores.</p>
          )}

          <div className="space-y-2">
            {visiblePlayers.map(player => (
              <Card
                key={player.id}
                className="flex items-center gap-3 cursor-pointer hover:ring-2 hover:ring-indigo-200 dark:hover:ring-indigo-700 transition-all"
                onClick={() => navigate(`/players/${player.id}`)}
              >
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0"
                  style={{ backgroundColor: player.color + '44' }}
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
        </>
      )}

      {tab === 'metrics' && (
        <>
          {metrics.length === 0 ? (
            <p className="text-center text-gray-400 py-12">Todavía no hay partidas jugadas.</p>
          ) : (
            <>
              {/* Segmented control */}
              <div className="flex items-center bg-gray-100 dark:bg-gray-700/60 rounded-xl p-1">
                <button
                  onClick={() => setMetricsView('elo')}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    metricsView === 'elo'
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  Ranking ELO
                </button>
                <button
                  onClick={() => setMetricsView('wins')}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    metricsView === 'wins'
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  Victorias
                </button>
              </div>

              {metricsView === 'elo' && (
                <>
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs text-gray-400">Puntuación basada en rival y resultado</p>
                    <button
                      onClick={() => setShowEloInfo(true)}
                      className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300 text-[10px] font-bold flex items-center justify-center leading-none shrink-0"
                    >
                      ?
                    </button>
                  </div>
                  <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-gray-700/50">
                    {byElo.map((m, i) => (
                      <div
                        key={m.player.id}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer active:bg-gray-50 dark:active:bg-gray-700/30"
                        onClick={() => navigate(`/players/${m.player.id}`)}
                      >
                        <span className="text-sm text-gray-400 w-4 shrink-0">{i + 1}</span>
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: m.player.color + '33' }}>
                          {m.player.avatar_emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{m.player.name}</p>
                          <p className="text-xs text-gray-400 truncate">
                            {m.sessions} {m.sessions === 1 ? 'partida' : 'partidas'}
                            {m.topGame && ` · ${m.topGame}`}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="score-num text-lg font-bold text-gray-900 dark:text-white">{m.elo}</p>
                          <p className={`text-xs font-medium ${m.elo > 1000 ? 'text-emerald-500 dark:text-emerald-400' : m.elo < 1000 ? 'text-red-400' : 'text-gray-400'}`}>
                            {m.elo > 1000 ? `+${m.elo - 1000}` : m.elo < 1000 ? `${m.elo - 1000}` : '±0'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {metricsView === 'wins' && (
                <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-gray-700/50">
                  {byWins.map((m, i) => (
                    <div
                      key={m.player.id}
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer active:bg-gray-50 dark:active:bg-gray-700/30"
                      onClick={() => navigate(`/players/${m.player.id}`)}
                    >
                      <span className="text-sm text-gray-400 w-4 shrink-0">{i + 1}</span>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: m.player.color + '33' }}>
                        {m.player.avatar_emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{m.player.name}</p>
                        <p className="text-xs text-gray-400 truncate">
                          {m.sessions} {m.sessions === 1 ? 'partida' : 'partidas'}
                          {m.topGame && ` · ${m.topGame}`}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="score-num text-lg font-bold text-gray-900 dark:text-white">{m.wins} vic.</p>
                        <p className="text-xs text-gray-400">{m.winRate}% ganadas</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      <Modal
        open={showAddModal}
        title="Agregar jugador"
        confirmLabel="Agregar"
        cancelLabel="Cancelar"
        onConfirm={handleAdd}
        onCancel={handleCloseAddModal}
      >
        <input
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          type="text"
          aria-label="Nombre del jugador"
          placeholder="Nombre del jugador"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 px-3 py-2.5 text-sm"
        />
      </Modal>

      <Modal
        open={showEloInfo}
        title="¿Qué es el ELO?"
        confirmLabel="Entendido"
        cancelLabel=""
        onConfirm={() => setShowEloInfo(false)}
        onCancel={() => setShowEloInfo(false)}
      >
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
          <p>El ELO es un sistema de rating que refleja el nivel competitivo de cada jugador a lo largo del tiempo.</p>
          <ul className="space-y-2">
            <li className="flex gap-2"><span className="text-indigo-500 font-bold shrink-0">1000</span><span>es el punto de partida de todos</span></li>
            <li className="flex gap-2"><span className="text-emerald-500 font-bold shrink-0">▲</span><span>Ganar suma puntos. Ganarle a alguien con más ELO suma más</span></li>
            <li className="flex gap-2"><span className="text-red-400 font-bold shrink-0">▼</span><span>Perder resta puntos. Perder contra alguien con menos ELO resta más</span></li>
            <li className="flex gap-2"><span className="text-gray-400 font-bold shrink-0">N</span><span>En partidas de más de 2 jugadores, se comparan todos contra todos</span></li>
          </ul>
        </div>
      </Modal>
    </div>
  );
}
