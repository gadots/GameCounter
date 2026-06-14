import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayers } from '../hooks/usePlayers';
import { sessionsStorage } from '../lib/storage';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/layout/PageHeader';

export function PlayersPage() {
  const { players, addPlayer } = usePlayers();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [tab, setTab] = useState<'list' | 'metrics'>('list');

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    addPlayer(trimmed);
    setName('');
  };

  const completed = sessionsStorage.getAll().filter(s => s.status === 'completed');

  const metrics = players
    .map(p => {
      const mySessions = completed.filter(s => s.player_ids.includes(p.id));
      const wins = mySessions.filter(s => s.winner_ids?.includes(p.id)).length;
      const gameCounts = mySessions.reduce((acc, s) => {
        acc[s.game_name] = (acc[s.game_name] ?? 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const topGame = Object.entries(gameCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
      return {
        player: p,
        sessions: mySessions.length,
        wins,
        winRate: mySessions.length > 0 ? Math.round((wins / mySessions.length) * 100) : 0,
        topGame,
      };
    })
    .filter(m => m.sessions > 0)
    .sort((a, b) => b.wins - a.wins || b.sessions - a.sessions);

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
            <div className="rounded-2xl bg-white dark:bg-gray-800 shadow-sm overflow-hidden divide-y divide-gray-100 dark:divide-gray-700/50">
              {metrics.map((m, i) => (
                <div
                  key={m.player.id}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer active:bg-gray-50 dark:active:bg-gray-700/30"
                  onClick={() => navigate(`/players/${m.player.id}`)}
                >
                  <span className="text-sm text-gray-400 w-4 shrink-0">{i + 1}</span>
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0"
                    style={{ backgroundColor: m.player.color + '33' }}
                  >
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
    </div>
  );
}
