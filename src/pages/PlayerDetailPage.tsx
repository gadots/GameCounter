import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { playersStorage, sessionsStorage } from '../lib/storage';
import { computeStreak, computeHeadToHead, computeGameStats, computeEloRatings } from '../lib/sessionEngine';
import { usePlayers } from '../hooks/usePlayers';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { PageHeader } from '../components/layout/PageHeader';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#14b8a6'];
const EMOJIS = ['🎲', '🏆', '⭐', '🎯', '🃏', '🎮', '🎪', '🎭'];

export function PlayerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updatePlayer, removePlayer } = usePlayers();

  const player = id ? playersStorage.getAll().find(p => p.id === id) ?? null : null;

  const [name, setName] = useState(player?.name ?? '');
  const [color, setColor] = useState(player?.color ?? COLORS[0]);
  const [emoji, setEmoji] = useState(player?.avatar_emoji ?? EMOJIS[0]);
  const [saved, setSaved] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!player) {
    return <div className="p-4 text-gray-400">Jugador no encontrado.</div>;
  }

  const allSessions = sessionsStorage.getAll();
  const allPlayers = playersStorage.getAll();
  const played = allSessions.filter(s => s.status === 'completed' && s.player_ids.includes(player.id));
  const won = played.filter(s => (s.winner_ids ?? []).includes(player.id)).length;
  const winrate = played.length > 0 ? Math.round((won / played.length) * 100) : 0;
  const streak = computeStreak(allSessions, player.id);

  const gameCounts: Record<string, number> = {};
  played.forEach(s => { gameCounts[s.game_name] = (gameCounts[s.game_name] ?? 0) + 1; });
  const favGame = Object.entries(gameCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

  const elo = played.length > 0 ? (computeEloRatings(allSessions)[player.id] ?? 1000) : null;

  const recentSessions = [...played]
    .sort((a, b) => new Date(b.completed_at ?? b.started_at).getTime() - new Date(a.completed_at ?? a.started_at).getTime())
    .slice(0, 5);
  const gameStats = computeGameStats(player.id, allSessions);
  const h2h = computeHeadToHead(player.id, allSessions);

  const nameSnapshot: Record<string, string> = {};
  allSessions.forEach(s => Object.entries(s.player_name_snapshots ?? {}).forEach(([pid, n]) => {
    if (!nameSnapshot[pid]) nameSnapshot[pid] = n;
  }));
  const resolveOpponent = (pid: string) => allPlayers.find(p => p.id === pid)?.name ?? nameSnapshot[pid] ?? 'Desconocido';
  const opponentPlayer = (pid: string) => allPlayers.find(p => p.id === pid);

  const deleteDescription = (() => {
    const activeSession = sessionsStorage.getActive();
    if (activeSession?.player_ids.includes(player.id)) {
      return `Está en la partida activa de ${activeSession.game_name}. Esa partida quedará eliminada.`;
    }
    const completedCount = sessionsStorage.getAll()
      .filter(s => s.status === 'completed' && s.player_ids.includes(player.id)).length;
    if (completedCount > 0) {
      return `Participó en ${completedCount} partida${completedCount !== 1 ? 's' : ''}. El historial se conserva.`;
    }
    return '¿Confirmar eliminación?';
  })();

  const handleConfirmDelete = () => {
    const activeSession = sessionsStorage.getActive();
    if (activeSession?.player_ids.includes(player.id)) {
      sessionsStorage.update(activeSession.id, { status: 'abandoned' });
    }
    removePlayer(player.id);
    navigate('/players');
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    updatePlayer(player.id, { name: trimmed, color, avatar_emoji: emoji });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 space-y-4">
      <PageHeader title={player.name} backPath="/players" />

      <Card className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-3xl shrink-0" style={{ backgroundColor: color + '33' }}>
            {emoji}
          </div>
          <div className="flex-1">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full text-lg font-semibold bg-transparent border-b border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 py-1"
            />
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Emoji</p>
          <div className="flex gap-2 flex-wrap">
            {EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all ${emoji === e ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/30' : 'bg-gray-100 dark:bg-gray-700'}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Color</p>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-800' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <Button className="w-full" onClick={handleSave} disabled={!name.trim()}>
          {saved ? '¡Guardado!' : 'Guardar cambios'}
        </Button>
      </Card>

      <Card>
        <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Estadísticas</p>
        {elo !== null && (
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100 dark:border-gray-700">
            <div>
              <p className="text-xs text-gray-400">Rating ELO</p>
              <p className="score-num text-3xl font-bold text-gray-900 dark:text-white mt-0.5">{elo}</p>
            </div>
            <div className={`text-sm font-semibold px-2.5 py-1 rounded-full ${
              elo > 1000
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                : elo < 1000
                ? 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-400'
            }`}>
              {elo > 1000 ? `+${elo - 1000}` : elo < 1000 ? `${elo - 1000}` : '±0'}
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <StatBox label="Partidas" value={played.length} />
          <StatBox label="Ganadas" value={won} />
          <StatBox label="Winrate" value={`${winrate}%`} />
          <StatBox
            label="Racha actual"
            value={streak.type === 'none' ? '—' : `${streak.count} ${streak.type === 'win' ? '🏆' : '💀'}`}
          />
        </div>
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400">Juego favorito</p>
          <p className="font-medium text-gray-800 dark:text-gray-100 mt-0.5">{favGame}</p>
        </div>
      </Card>

      {recentSessions.length > 0 && (
        <Card>
          <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Últimas partidas</p>
          <div className="space-y-2">
            {recentSessions.map(s => {
              const winners = s.winner_ids ?? [];
              const isWin = winners.includes(player.id);
              const isTie = isWin && winners.length > 1;
              return (
                <div key={s.id} className="flex items-center gap-3">
                  <span className="text-base w-5 shrink-0">{isTie ? '🤝' : isWin ? '🏆' : '💀'}</span>
                  <span className="flex-1 text-sm text-gray-800 dark:text-gray-200 truncate">{s.game_name}</span>
                  <span className="text-xs text-gray-400 shrink-0">
                    {new Date(s.completed_at ?? s.started_at).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {gameStats.length >= 2 && (
        <Card>
          <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Por juego</p>
          <div className="space-y-2">
            {gameStats.map(g => (
              <div key={g.gameId} className="flex items-center gap-3">
                <span className="flex-1 text-sm text-gray-800 dark:text-gray-200 truncate">{g.gameName}</span>
                <span className="text-xs text-gray-400 shrink-0">{g.played}P</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white w-10 text-right shrink-0">{g.winRate}%</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {h2h.length > 0 && (
        <Card>
          <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Head-to-head</p>
          <div className="space-y-3">
            {h2h.map(match => {
              const opp = opponentPlayer(match.opponentId);
              return (
                <div key={match.opponentId} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0" style={{ backgroundColor: (opp?.color ?? '#6366f1') + '33' }}>
                    {opp?.avatar_emoji ?? '🎲'}
                  </div>
                  <span className="flex-1 text-sm text-gray-800 dark:text-gray-200 truncate">{resolveOpponent(match.opponentId)}</span>
                  <span className="text-sm font-bold text-gray-900 dark:text-white shrink-0">{match.wins}–{match.losses}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <Button variant="secondary" className="w-full" onClick={() => navigate(`/history?player=${player.id}`)}>
        Ver partidas
      </Button>

      <button
        className="w-full text-sm text-red-400 hover:text-red-600 dark:hover:text-red-300 py-1 transition-colors"
        onClick={() => setShowDeleteModal(true)}
      >
        Eliminar jugador
      </button>

      <Modal
        open={showDeleteModal}
        title={`¿Eliminar a ${player.name}?`}
        description={deleteDescription}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</p>
    </div>
  );
}
