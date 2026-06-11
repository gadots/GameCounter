import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionsStorage, playersStorage } from '../lib/storage';
import { getGameModule } from '../lib/gameLoader';
import { computePlayerTotals, withWinners, resolvePlayerName } from '../lib/sessionEngine';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

const MEDALS = ['🥇', '🥈', '🥉'];

function buildWhatsAppText(session: any, totals: any[], players: any[], date: Date): string {
  const sorted = [...totals].sort((a, b) => b.grand_total - a.grand_total);
  const dateStr = date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const lines = [
    `🎲 *${session.game_name}* — ${dateStr}`,
    '',
    ...sorted.map((t, i) => {
      const medal = MEDALS[i] ?? `${i + 1}.`;
      const name = resolvePlayerName(t.player_id, players, session);
      const pts = session.game_id === 'uno' || totals.some(x => x.grand_total !== 0) ? ` — ${t.grand_total} pts` : '';
      return `${medal} ${name}${pts}${t.is_winner ? ' 🏆' : ''}`;
    }),
    '',
    '📱 counter-nine.vercel.app',
  ];
  return lines.join('\n');
}

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
                <span className="flex-1 text-gray-800 dark:text-gray-100">{resolvePlayerName(t.player_id, players, session)}</span>
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
                  return (
                    <tr key={t.player_id} className="border-t border-gray-100 dark:border-gray-700">
                      <td className="py-2 text-gray-700 dark:text-gray-200">{resolvePlayerName(t.player_id, players, session)}</td>
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

      {module.metadata.tiebreaker_hint && (
        <p className="text-xs text-gray-400 italic text-center px-2">{module.metadata.tiebreaker_hint}</p>
      )}

      <a
        href={`https://wa.me/?text=${encodeURIComponent(buildWhatsAppText(session, totals, players, date))}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-medium text-white transition-opacity active:opacity-80"
        style={{ backgroundColor: '#25D366' }}
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        Compartir resultado
      </a>

      <div className="flex gap-2">
        <Button
          className="flex-1"
          variant="secondary"
          onClick={() => navigate(`/session/new?game=${session.game_id}&players=${session.player_ids.join(',')}`)}
        >
          Revancha
        </Button>
        <Button className="flex-1" onClick={() => navigate('/session/new')}>
          Nueva partida
        </Button>
      </div>

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
