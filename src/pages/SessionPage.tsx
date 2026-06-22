import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useBlocker } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import { usePlayers } from '../hooks/usePlayers';
import { useSettings } from '../hooks/useSettings';
import { useTranslation } from '../hooks/useTranslation';
import { getGameModule } from '../lib/gameLoader';
import { computePlayerTotals, withWinners, resolvePlayerName, isTargetReached } from '../lib/sessionEngine';
import { InputRenderer } from '../components/ui/InputRenderer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { sessionsStorage } from '../lib/storage';
import { supabase } from '../lib/supabase';
import { startSharing, syncSession } from '../lib/sharing';
import { Share2, Check } from 'lucide-react';
import type { InputValues, Session, GameModule, Player } from '../lib/types';

export function SessionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session, submitRound, endSession, undoLastRound, enterFinalBonus } = useSession(id ?? null);
  const { players } = usePlayers();
  const { settings } = useSettings();
  const { t } = useTranslation();

  const module = session ? getGameModule(session.game_id) : null;

  const [activePlayer, setActivePlayer] = useState(0);
  const [roundInputs, setRoundInputs] = useState<Record<string, InputValues>>({});
  const [error, setError] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const exitingRef = useRef(false);

  useEffect(() => {
    if (sharing && session) syncSession(session);
  }, [session, sharing]);

  // Block navigation away from an active session.
  // exitingRef bypasses the blocker when we navigate programmatically on confirm.
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !exitingRef.current &&
      session?.status === 'active' &&
      currentLocation.pathname !== nextLocation.pathname
  );

  if (!session || !module) {
    return <div className="p-4 text-gray-400">{t('session.notFound')}</div>;
  }

  if (session.status === 'completed') {
    const totals = withWinners(computePlayerTotals(session, module));
    const winners = totals.filter(t => t.is_winner);
    const winnerNames = winners.map(tot => resolvePlayerName(tot.player_id, players, session)).join(', ');

    return (
      <div className="p-4 space-y-6">
        <div className="text-center py-6">
          <div className="text-5xl mb-3">🏆</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {winners.length === 1 ? t('session.winnerSingle', { name: winnerNames }) : t('session.winnerTie', { names: winnerNames })}
          </h2>
          <p className="text-gray-400 mt-1">{session.game_name}</p>
        </div>

        <div className="space-y-1">
          {totals.sort((a, b) => b.grand_total - a.grand_total).map((tot, rank) => {
            const player = players.find(p => p.id === tot.player_id);
            const color = player?.color ?? '#6366f1';
            return (
              <div
                key={tot.player_id}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-all border-l-[3px] ${tot.is_winner ? '' : 'border-transparent'}`}
                style={tot.is_winner ? { borderLeftColor: color, backgroundColor: color + '22' } : {}}
              >
                <span className="text-sm text-gray-400 w-4 shrink-0">{rank + 1}</span>
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: color + '44' }}>
                  {player?.avatar_emoji ?? '🎲'}
                </div>
                <p className="flex-1 font-medium text-gray-800 dark:text-gray-100">{resolvePlayerName(tot.player_id, players, session)}</p>
                {tot.is_winner && <span className="text-base">🏆</span>}
                <span className="score-num text-2xl font-bold text-gray-900 dark:text-white">
                  {tot.grand_total}
                </span>
              </div>
            );
          })}
        </div>

        <Button className="w-full" variant="secondary" onClick={() => navigate('/history')}>
          {t('session.viewHistory')}
        </Button>
        <Button className="w-full" onClick={() => navigate('/session/new')}>
          {t('session.newSession')}
        </Button>
      </div>
    );
  }

  const isFinalBonus = session.in_final_bonus ?? false;
  const isCooperative = module.metadata.cooperative ?? false;
  const modeInputs = module.getInputs?.(session.mode_id ?? '') ?? module.inputs;
  const activeInputs = isFinalBonus ? (module.final_round?.inputs ?? modeInputs) : modeInputs;
  const finalBonusLabel = module.final_round?.label ?? 'Bonificación final';

  // In cooperative mode all players share the same input slot (first player).
  const currentPlayerId = isCooperative ? session.player_ids[0] : session.player_ids[activePlayer];
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const currentValues = roundInputs[currentPlayerId] ?? {};

  const setValues = (vals: InputValues) =>
    setRoundInputs(prev => ({ ...prev, [currentPlayerId]: vals }));

  // Build a map of exclusive inputs already claimed by previous players this round.
  const takenBy: Record<string, string> = {};
  if (!isCooperative) {
    activeInputs.forEach(inp => {
      if (!inp.exclusive_group) return;
      for (let i = 0; i < activePlayer; i++) {
        const pid = session.player_ids[i];
        if (roundInputs[pid]?.[inp.id]) {
          takenBy[inp.id] = players.find(p => p.id === pid)?.name ?? 'otro jugador';
          break;
        }
      }
    });
  }

  const handleSubmit = () => {
    if (module.validate) {
      const err = module.validate(currentValues);
      if (err) { setError(err); return; }
    }
    setError(null);

    if (isCooperative) {
      // Same inputs applied to every player.
      const allInputs = Object.fromEntries(session.player_ids.map(pid => [pid, currentValues]));
      submitRound(allInputs);
      setRoundInputs({});
      return;
    }

    if (activePlayer < session.player_ids.length - 1) {
      setActivePlayer(prev => prev + 1);
      return;
    }

    submitRound(roundInputs);
    setRoundInputs({});
    setActivePlayer(0);

    if (module.metadata.target_score) {
      const fresh = sessionsStorage.getById(session.id);
      if (fresh && fresh.status === 'active') {
        const totals = computePlayerTotals(fresh, module);
        if (isTargetReached(totals, module)) {
          endSession();
        }
      }
    }
  };

  const isLastPlayer = isCooperative || activePlayer === session.player_ids.length - 1;

  const handleShare = async () => {
    const result = await startSharing(session);
    if ('error' in result) { setError(`Sharing error: ${result.error}`); return; }
    setSharing(true);
    setError(null);
    await navigator.clipboard.writeText(result.url).catch(() => {});
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2500);
  };

  const handleUndoRound = () => {
    const prevInputs = undoLastRound();
    if (prevInputs) setRoundInputs(prevInputs);
    setActivePlayer(0);
    setError(null);
  };

  return (
    <>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{session.game_name}</h1>
            {isFinalBonus ? (
              <p className="text-sm font-medium text-indigo-500 dark:text-indigo-400">{finalBonusLabel}</p>
            ) : module.metadata.modes && session.mode_id ? (
              <p className="text-sm text-gray-400">
                {module.metadata.modes.find(m => m.id === session.mode_id)?.name}
                {module.metadata.scoring_mode === 'per_round' && ` · ${module.metadata.total_rounds
                  ? t('session.roundNOfTotal', { n: session.current_round, total: module.metadata.total_rounds })
                  : t('session.roundN', { n: session.current_round })}`}
              </p>
            ) : module.metadata.scoring_mode === 'per_round' && (
              <p className="text-sm text-gray-400">
                {module.metadata.total_rounds
                  ? t('session.roundNOfTotal', { n: session.current_round, total: module.metadata.total_rounds })
                  : t('session.roundN', { n: session.current_round })}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {supabase && (
              <button
                onClick={handleShare}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors ${
                  sharing
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                {shareCopied ? <Check size={14} /> : <Share2 size={14} />}
                <span>{shareCopied ? t('session.copied') : sharing ? t('session.live') : t('session.share')}</span>
              </button>
            )}
            {module.metadata.scoring_mode === 'end_of_game' && (
              <Button variant="ghost" size="sm" onClick={endSession}>
                {t('session.end')}
              </Button>
            )}
            {module.metadata.scoring_mode === 'per_round' && module.final_round && !module.metadata.total_rounds && !isFinalBonus && (
              <Button variant="ghost" size="sm" onClick={enterFinalBonus}>
                {t('session.goToBonus')}
              </Button>
            )}
            {module.metadata.scoring_mode === 'per_round' && !module.metadata.total_rounds && !module.metadata.target_score && !module.final_round && (
              <Button variant="ghost" size="sm" onClick={endSession}>
                {t('session.end')}
              </Button>
            )}
          </div>
        </div>

        {!isCooperative && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {session.player_ids.map((pid, i) => {
              const p = players.find(pl => pl.id === pid);
              const color = p?.color ?? '#6366f1';
              const isActive = i === activePlayer;
              return (
                <button
                  key={pid}
                  onClick={() => setActivePlayer(i)}
                  aria-label={t('session.selectPlayer', { name: p?.name ?? 'Jugador' })}
                  aria-pressed={isActive}
                  style={isActive ? { backgroundColor: color } : {}}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium shrink-0 transition-all ${
                    isActive ? 'text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                  }`}
                >
                  <span>{p?.avatar_emoji ?? '🎲'}</span>
                  <span>{p?.name ?? pid}</span>
                  {roundInputs[pid] && (
                    <span className={`text-xs ${isActive ? 'text-green-200' : 'text-green-500'}`}>✓</span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        <Card>
          {isCooperative ? (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex -space-x-2">
                {session.player_ids.slice(0, 4).map(pid => {
                  const p = players.find(pl => pl.id === pid);
                  return (
                    <div key={pid} className="w-7 h-7 rounded-full flex items-center justify-center text-sm border-2 border-white dark:border-gray-800" style={{ backgroundColor: (p?.color ?? '#6366f1') + '44' }}>
                      {p?.avatar_emoji ?? '🎲'}
                    </div>
                  );
                })}
              </div>
              <p className="font-semibold text-gray-800 dark:text-gray-100">{t('session.allPlayers')}</p>
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-base" style={{ backgroundColor: (currentPlayer?.color ?? '#6366f1') + '33' }}>
                {currentPlayer?.avatar_emoji ?? '🎲'}
              </div>
              <p className="font-semibold text-gray-800 dark:text-gray-100">{currentPlayer?.name ?? 'Jugador'}</p>
            </div>
          )}
          <InputRenderer
            inputs={activeInputs}
            values={currentValues}
            onChange={(inputId, val) => setValues({ ...currentValues, [inputId]: val })}
            takenBy={Object.keys(takenBy).length > 0 ? takenBy : undefined}
          />
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </Card>

        <Button className="w-full" size="lg" onClick={handleSubmit}>
          {isLastPlayer
            ? (isFinalBonus || module.metadata.scoring_mode === 'end_of_game' ? t('session.calcWinner') : t('session.registerRound'))
            : t('session.nextPlayer', { name: players.find(p => p.id === session.player_ids[activePlayer + 1])?.name ?? '...' })}
        </Button>

        {isFinalBonus ? (
          <Button variant="secondary" className="w-full" onClick={handleUndoRound}>
            {t('session.cancelBonus')}
          </Button>
        ) : module.metadata.scoring_mode === 'per_round' && session.current_round > 1 && (
          <Button variant="secondary" className="w-full" onClick={handleUndoRound}>
            {t('session.editRound', { n: session.current_round - 1 })}
          </Button>
        )}

        {session.scores.length > 0 && module.metadata.scoring_mode === 'per_round' && settings.show_running_totals && (
          <ScoreTable session={session} module={module} players={players} />
        )}
      </div>

      {/* Navigation blocker modal */}
      <Modal
        open={blocker.state === 'blocked'}
        title={t('session.leaveTitle')}
        description={t('session.leaveDesc')}
        confirmLabel={t('session.leave')}
        cancelLabel={t('session.keepPlaying')}
        confirmVariant="danger"
        onConfirm={() => { exitingRef.current = true; blocker.reset?.(); navigate('/session/new'); }}
        onCancel={() => blocker.reset?.()}
      />
    </>
  );
}

function ScoreTable({ session, module, players }: { session: Session; module: GameModule; players: Player[] }) {
  const { t } = useTranslation();
  const totals = computePlayerTotals(session, module).sort((a, b) => b.grand_total - a.grand_total);
  const leader = totals[0];
  return (
    <Card>
      <p className="text-xs font-semibold text-gray-400 uppercase mb-3">{t('session.runningTotals')}</p>
      <div className="space-y-2">
        {totals.map((tot, rank) => {
          const p = players.find(pl => pl.id === tot.player_id);
          const color = p?.color ?? '#6366f1';
          const isLeader = tot.player_id === leader?.player_id && totals.length > 1;
          return (
            <div key={tot.player_id} className="flex items-center gap-3">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0"
                style={{ backgroundColor: color + '44' }}
              >
                {p?.avatar_emoji ?? '🎲'}
              </div>
              <span className="flex-1 text-sm text-gray-700 dark:text-gray-200">{p?.name ?? 'Jugador'}</span>
              {isLeader && rank === 0 && (
                <span className="text-xs">👑</span>
              )}
              <span className={`score-num text-2xl font-bold ${tot.grand_total < 0 ? 'text-red-400 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                {tot.grand_total}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
