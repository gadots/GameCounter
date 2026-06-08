import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionsStorage, playersStorage } from '../lib/storage';
import { getGameModule } from '../lib/gameLoader';
import { computePlayerTotals, withWinners } from '../lib/sessionEngine';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

export function SessionSummaryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const session = id ? sessionsStorage.getById(id) : null;
  const module = session ? getGameModule(session.game_id) : null;
  const players = playersStorage.getAll();

  if (!session || !module) {
    return <div className="p-4 text-gray-400">Partida no encontrada.</div>;
  }

  const totals = withWinners(computePlayerTotals(session, module));
  const date = new Date(session.completed_at ?? session.started_at);

  return (
    <div className="p-4 space-y-4">
      <button onClick={() => navigate('/history')} className="text-sm text-indigo-500 flex items-center gap-1">
        ← Volver al historial
      </button>

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{session.game_name}</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {date.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
        </p>
      </div>

      <Card>
        <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Resultado final</p>
        <div className="space-y-3">
          {totals.sort((a, b) => b.grand_total - a.grand_total).map((t, i) => {
            const player = players.find(p => p.id === t.player_id);
            return (
              <div key={t.player_id} className={`flex items-center gap-3 ${t.is_winner ? 'font-bold' : ''}`}>
                <span className="text-gray-400 text-sm w-4">{i + 1}</span>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0" style={{ backgroundColor: (player?.color ?? '#6366f1') + '33' }}>
                  {player?.avatar_emoji ?? '🎲'}
                </div>
                <span className="flex-1 text-gray-800 dark:text-gray-100">{player?.name ?? 'Jugador'}</span>
                {t.is_winner && <span>🏆</span>}
                <span className="text-lg text-gray-900 dark:text-white">{t.grand_total}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {module.metadata.scoring_mode === 'per_round' && (
        <Card>
          <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Puntajes por ronda</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left text-gray-400 font-normal pb-2">Jugador</th>
                  {Array.from(new Set(session.scores.map(s => s.round))).sort((a, b) => a - b).map(r => (
                    <th key={r} className="text-center text-gray-400 font-normal pb-2 px-2">R{r}</th>
                  ))}
                  <th className="text-right text-gray-400 font-normal pb-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {totals.sort((a, b) => b.grand_total - a.grand_total).map(t => {
                  const player = players.find(p => p.id === t.player_id);
                  return (
                    <tr key={t.player_id} className="border-t border-gray-100 dark:border-gray-700">
                      <td className="py-2 text-gray-700 dark:text-gray-200">{player?.name}</td>
                      {t.round_scores.map((score, i) => (
                        <td key={i} className={`text-center px-2 py-2 ${score < 0 ? 'text-red-500' : 'text-gray-700 dark:text-gray-200'}`}>
                          {score}
                        </td>
                      ))}
                      <td className="text-right font-bold text-gray-900 dark:text-white py-2">{t.grand_total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Button className="w-full" onClick={() => navigate('/session/new')}>
        Nueva partida
      </Button>

      <button
        className="w-full text-sm text-red-400 hover:text-red-600 dark:hover:text-red-300 py-1 transition-colors"
        onClick={() => setShowDeleteModal(true)}
      >
        Borrar esta partida
      </button>

      <Modal
        open={showDeleteModal}
        title="¿Borrar partida?"
        description={`${session.game_name} — ${date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}`}
        confirmLabel="Borrar"
        cancelLabel="Cancelar"
        confirmVariant="danger"
        onConfirm={() => { sessionsStorage.remove(session.id); navigate('/history'); }}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
}
