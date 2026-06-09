import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { playersStorage, sessionsStorage } from '../lib/storage';
import { computeStreak } from '../lib/sessionEngine';
import { usePlayers } from '../hooks/usePlayers';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import type { Session } from '../lib/types';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#14b8a6'];
const EMOJIS = ['🎲', '🏆', '⭐', '🎯', '🃏', '🎮', '🎪', '🎭'];

export function PlayerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updatePlayer } = usePlayers();

  const player = id ? playersStorage.getAll().find(p => p.id === id) ?? null : null;

  const [name, setName] = useState(player?.name ?? '');
  const [color, setColor] = useState(player?.color ?? COLORS[0]);
  const [emoji, setEmoji] = useState(player?.avatar_emoji ?? EMOJIS[0]);
  const [saved, setSaved] = useState(false);

  if (!player) {
    return <div className="p-4 text-gray-400">Jugador no encontrado.</div>;
  }

  const allSessions = sessionsStorage.getAll();
  const played = allSessions.filter(s => s.status === 'completed' && s.player_ids.includes(player.id));
  const won = played.filter(s => (s.winner_ids ?? []).includes(player.id)).length;
  const winrate = played.length > 0 ? Math.round((won / played.length) * 100) : 0;
  const streak = computeStreak(allSessions, player.id);

  const gameCounts: Record<string, number> = {};
  played.forEach(s => { gameCounts[s.game_name] = (gameCounts[s.game_name] ?? 0) + 1; });
  const favGame = Object.entries(gameCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—';

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    updatePlayer(player.id, { name: trimmed, color, avatar_emoji: emoji });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 space-y-4">
      <button onClick={() => navigate('/players')} className="text-sm text-indigo-500 flex items-center gap-1">
        ← Jugadores
      </button>

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

      <Button variant="secondary" className="w-full" onClick={() => navigate(`/history?player=${player.id}`)}>
        Ver partidas
      </Button>
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
