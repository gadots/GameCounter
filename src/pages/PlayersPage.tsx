import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayers } from '../hooks/usePlayers';
import { sessionsStorage } from '../lib/storage';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import type { Player } from '../lib/types';

export function PlayersPage() {
  const { players, addPlayer, removePlayer } = usePlayers();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [pendingDelete, setPendingDelete] = useState<Player | null>(null);

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    addPlayer(trimmed);
    setName('');
  };

  const handleConfirmDelete = () => {
    if (!pendingDelete) return;
    const activeSession = sessionsStorage.getActive();
    if (activeSession?.player_ids.includes(pendingDelete.id)) {
      sessionsStorage.update(activeSession.id, { status: 'abandoned' });
    }
    removePlayer(pendingDelete.id);
    setPendingDelete(null);
  };

  const getDeleteDescription = (player: Player): string => {
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
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Jugadores</h1>

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
              style={{ backgroundColor: player.color + '33' }}
            >
              {player.avatar_emoji}
            </div>
            <p className="flex-1 font-medium text-gray-800 dark:text-gray-100">{player.name}</p>
            <button
              onClick={e => { e.stopPropagation(); setPendingDelete(player); }}
              className="text-gray-400 hover:text-red-500 text-sm transition-colors p-1"
            >
              ✕
            </button>
          </Card>
        ))}
      </div>

      {pendingDelete && (
        <Modal
          open={true}
          title={`¿Eliminar a ${pendingDelete.name}?`}
          description={getDeleteDescription(pendingDelete)}
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          confirmVariant="danger"
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </div>
  );
}
