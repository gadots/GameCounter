import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionsStorage } from '../lib/storage';
import { computeStreak, computeHeadToHead, computeGameStats, computeEloRatings, computeEloHistory } from '../lib/sessionEngine';
import { usePlayers } from '../hooks/usePlayers';
import { useSessions } from '../hooks/useSession';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { PageHeader } from '../components/layout/PageHeader';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#14b8a6'];
const EMOJIS = ['🎲', '🏆', '⭐', '🎯', '🃏', '🎮', '🎪', '🎭'];

export function PlayerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { players: allPlayers, updatePlayer, removePlayer } = usePlayers();
  const allSessions = useSessions();

  const player = id ? allPlayers.find(p => p.id === id) ?? null : null;

  const [name, setName] = useState(player?.name ?? '');
  const [color, setColor] = useState(player?.color ?? COLORS[0]);
  const [emoji, setEmoji] = useState(player?.avatar_emoji ?? EMOJIS[0]);
  const [saved, setSaved] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // All derived stats are recomputed only when the player or sessions change,
  // not on every render (color picker, name edits, modal toggles, etc.).
  const stats = useMemo(() => {
    if (!player) return null;
    const played = allSessions.filter(s => s.status === 'completed' && s.player_ids.includes(player.id));
    const won = played.filter(s => (s.winner_ids ?? []).includes(player.id)).length;
    const winrate = played.length > 0 ? Math.round((won / played.length) * 100) : 0;
    const streak = computeStreak(allSessions, player.id);

    const gameCounts: Record<string, number> = {};
    played.forEach(s => { gameCounts[s.game_name] = (gameCounts[s.game_name] ?? 0) + 1; });
    const favGame = Object.entries(gameCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

    const elo = played.length > 0 ? (computeEloRatings(allSessions)[player.id] ?? 1000) : null;
    const eloHistory = computeEloHistory(player.id, allSessions);

    const recentSessions = [...played]
      .sort((a, b) => new Date(b.completed_at ?? b.started_at).getTime() - new Date(a.completed_at ?? a.started_at).getTime())
      .slice(0, 5);
    const gameStats = computeGameStats(player.id, allSessions);
    const h2h = computeHeadToHead(player.id, allSessions);

    const nameSnapshot: Record<string, string> = {};
    allSessions.forEach(s => Object.entries(s.player_name_snapshots ?? {}).forEach(([pid, n]) => {
      if (!nameSnapshot[pid]) nameSnapshot[pid] = n;
    }));

    return { played, won, winrate, streak, favGame, elo, eloHistory, recentSessions, gameStats, h2h, nameSnapshot };
  }, [player, allSessions]);

  if (!player || !stats) {
    return <div className="p-4 text-gray-400">Jugador no encontrado.</div>;
  }

  const { played, won, winrate, streak, favGame, elo, eloHistory, recentSessions, gameStats, h2h, nameSnapshot } = stats;

  const resolveOpponent = (pid: string) => allPlayers.find(p => p.id === pid)?.name ?? nameSnapshot[pid] ?? 'Desconocido';
  const opponentPlayer = (pid: string) => allPlayers.find(p => p.id === pid);

  const deleteDescription = (() => {
    const activeSession = allSessions.find(s => s.status === 'active') ?? null;
    if (activeSession?.player_ids.includes(player.id)) {
      return `Está en la partida activa de ${activeSession.game_name}. Esa partida quedará eliminada.`;
    }
    if (played.length > 0) {
      return `Participó en ${played.length} partida${played.length !== 1 ? 's' : ''}. El historial se conserva.`;
    }
    return '¿Confirmar eliminación?';
  })();

  const handleConfirmDelete = () => {
    const activeSession = allSessions.find(s => s.status === 'active') ?? null;
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
                aria-label={`Avatar ${e}`}
                aria-pressed={emoji === e}
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
            {COLORS.map((c, i) => (
              <button
                key={c}
                aria-label={`Color ${i + 1}`}
                aria-pressed={color === c}
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

      {eloHistory.length >= 2 && (
        <Card>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-400 uppercase">Progresión ELO</p>
            <span className="text-xs text-gray-400">base 1000</span>
          </div>
          <EloChart history={eloHistory} />
          <div className="flex justify-between mt-1.5 text-xs text-gray-400">
            <span>{new Date(eloHistory[0].date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}</span>
            <span>{new Date(eloHistory[eloHistory.length - 1].date).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}</span>
          </div>
        </Card>
      )}

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

function EloChart({ history }: { history: { elo: number; game_name: string; date: string }[] }) {
  const W = 300, H = 80;
  const PAD = { top: 12, right: 8, bottom: 8, left: 8 };
  const cW = W - PAD.left - PAD.right;
  const cH = H - PAD.top - PAD.bottom;

  const elos = history.map(h => h.elo);
  const rawMin = Math.min(...elos, 1000);
  const rawMax = Math.max(...elos, 1000);
  // Add 10% headroom so the line isn't flush against the edges
  const pad = Math.max((rawMax - rawMin) * 0.15, 8);
  const minV = rawMin - pad;
  const maxV = rawMax + pad;
  const range = maxV - minV;

  const toX = (i: number) => PAD.left + (history.length < 2 ? cW / 2 : (i / (history.length - 1)) * cW);
  const toY = (v: number) => PAD.top + cH - ((v - minV) / range) * cH;

  const pts = history.map((h, i) => ({ x: toX(i), y: toY(h.elo) }));
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${line} L${pts[pts.length - 1].x.toFixed(1)},${(PAD.top + cH).toFixed(1)} L${PAD.left},${(PAD.top + cH).toFixed(1)} Z`;
  const baseY = toY(1000);

  const showDots = history.length <= 14;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 80 }}>
      <defs>
        <linearGradient id="elo-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Baseline 1000 */}
      <line
        x1={PAD.left} y1={baseY} x2={W - PAD.right} y2={baseY}
        stroke="#9ca3af" strokeWidth="1" strokeDasharray="4 3" strokeOpacity="0.45"
      />
      <path d={area} fill="url(#elo-grad)" />
      <path d={line} fill="none" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      {showDots && pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="white" stroke="#6366f1" strokeWidth="1.5" />
      ))}
      {/* Always mark first and last */}
      {!showDots && <>
        <circle cx={pts[0].x} cy={pts[0].y} r="3" fill="white" stroke="#6366f1" strokeWidth="1.5" />
        <circle cx={pts[pts.length-1].x} cy={pts[pts.length-1].y} r="3" fill="white" stroke="#6366f1" strokeWidth="1.5" />
      </>}
    </svg>
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
