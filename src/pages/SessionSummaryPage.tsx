import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { sessionsStorage, playersStorage } from '../lib/storage';
import { getGameModule } from '../lib/gameLoader';
import { computePlayerTotals, withWinners, resolvePlayerName } from '../lib/sessionEngine';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { PageHeader } from '../components/layout/PageHeader';
import { Share2 } from 'lucide-react';
import { useRef } from 'react';
import type { Session, Player, PlayerTotals } from '../lib/types';

const MEDALS = ['🥇', '🥈', '🥉'];

function buildWhatsAppText(session: Session, totals: PlayerTotals[], players: Player[], date: Date): string {
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
  const [notes, setNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);
  const notesInitialized = useRef(false);

  const session = id ? sessionsStorage.getById(id) : null;
  const module = session ? getGameModule(session.game_id) : null;
  const players = playersStorage.getAll();

  if (session && !notesInitialized.current) {
    notesInitialized.current = true;
    setNotes(session.notes ?? '');
  }

  const handleNotesSave = () => {
    if (!session) return;
    sessionsStorage.update(session.id, { notes });
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  if (!session) {
    return <div className="p-4 text-gray-400">Partida no encontrada.</div>;
  }

  const totals = withWinners(computePlayerTotals(session, module));
  const date = new Date(session.completed_at ?? session.started_at);

  // New record detection: compare current session's top score vs previous sessions
  const prevSessions = sessionsStorage.getAll()
    .filter(s => s.status === 'completed' && s.game_id === session.game_id && s.id !== session.id);
  const currentTopScore = Math.max(...totals.map(t => t.grand_total), 0);
  const prevTopScore = prevSessions.length > 0
    ? Math.max(0, ...prevSessions.flatMap(s =>
        Object.values(s.scores.reduce((acc, sc) => {
          acc[sc.player_id] = (acc[sc.player_id] ?? 0) + sc.computed_score;
          return acc;
        }, {} as Record<string, number>))
      ))
    : null;
  const isNewRecord = prevTopScore !== null && currentTopScore > prevTopScore && currentTopScore > 0;
  const recordHolder = isNewRecord
    ? totals.find(t => t.grand_total === currentTopScore)
    : null;
  const recordHolderName = recordHolder
    ? resolvePlayerName(recordHolder.player_id, players, session)
    : null;

  return (
    <div className="p-4 space-y-4">
      <PageHeader title={session.game_name} backPath="/history" />
      <p className="text-sm text-gray-400 -mt-4">
        {date.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
      </p>

      <Card>
        <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Resultado final</p>
        <div className="space-y-1">
          {totals.sort((a, b) => b.grand_total - a.grand_total).map((t, i) => {
            const player = players.find(p => p.id === t.player_id);
            const color = player?.color ?? '#6366f1';
            return (
              <div
                key={t.player_id}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all border-l-[3px] ${t.is_winner ? '' : 'border-transparent'}`}
                style={t.is_winner ? { borderLeftColor: color, backgroundColor: color + '22' } : {}}
              >
                <span className="text-gray-400 text-sm w-4 shrink-0">{i + 1}</span>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-base shrink-0" style={{ backgroundColor: color + '44' }}>
                  {player?.avatar_emoji ?? '🎲'}
                </div>
                <span className="flex-1 text-gray-800 dark:text-gray-100">{resolvePlayerName(t.player_id, players, session)}</span>
                {t.is_winner && <span>🏆</span>}
                <span className="score-num text-xl font-bold text-gray-900 dark:text-white">
                  {t.grand_total}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {module?.metadata.scoring_mode === 'per_round' && (
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

      {module?.metadata.tiebreaker_hint && (
        <p className="text-xs text-gray-400 italic text-center px-2">{module.metadata.tiebreaker_hint}</p>
      )}

      {isNewRecord && recordHolderName && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50">
          <span className="text-2xl">🏆</span>
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">¡Nuevo récord!</p>
            <p className="text-xs text-amber-600 dark:text-amber-400">
              {recordHolderName} — {currentTopScore} pts en {session.game_name}
            </p>
          </div>
        </div>
      )}

      <Card>
        <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Notas</p>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          onBlur={handleNotesSave}
          placeholder="Agregá notas, reglas usadas, quién jugó mejor..."
          rows={3}
          className="w-full text-sm bg-transparent text-gray-700 dark:text-gray-200 placeholder-gray-300 dark:placeholder-gray-600 resize-none focus:outline-none"
        />
        {notesSaved && (
          <p className="text-xs text-emerald-500 mt-1">✓ Guardado</p>
        )}
      </Card>

      <a
        href={`https://wa.me/?text=${encodeURIComponent(buildWhatsAppText(session, totals, players, date))}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2.5 w-full py-3 rounded-2xl font-semibold text-white bg-indigo-600 active:bg-indigo-700 transition-colors"
      >
        <Share2 size={18} />
        <span>Compartir resultado</span>
        <span className="ml-0.5 text-indigo-300 text-xs font-normal">vía WhatsApp</span>
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
