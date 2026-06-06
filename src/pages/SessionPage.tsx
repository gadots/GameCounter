import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSession } from '../hooks/useSession';
import { usePlayers } from '../hooks/usePlayers';
import { getGameModule } from '../lib/gameLoader';
import { computePlayerTotals, withWinners } from '../lib/sessionEngine';
import { InputRenderer } from '../components/ui/InputRenderer';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import type { InputValues } from '../lib/types';

export function SessionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { session, submitRound, endSession } = useSession(id ?? null);
  const { players } = usePlayers();

  const module = session ? getGameModule(session.game_id) : null;

  const [activePlayer, setActivePlayer] = useState(0);
  const [roundInputs, setRoundInputs] = useState<Record<string, InputValues>>({});
  const [error, setError] = useState<string | null>(null);

  if (!session || !module) {
    return <div className="p-4 text-gray-400">Sesión no encontrada.</div>;
  }

  if (session.status === 'completed') {
    const totals = withWinners(computePlayerTotals(session, module));
    const winners = totals.filter(t => t.is_winner);
    const winnerNames = winners.map(t => players.find(p => p.id === t.player_id)?.name ?? 'Desconocido').join(', ');

    return (
      <div className="p-4 space-y-6">
        <div className="text-center py-6">
          <div className="text-5xl mb-3">🏆</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {winners.length === 1 ? `¡Ganó ${winnerNames}!` : `¡Empate! ${winnerNames}`}
          </h2>
          <p className="text-gray-400 mt-1">{session.game_name}</p>
        </div>

        <div className="space-y-2">
          {totals.sort((a, b) => b.grand_total - a.grand_total).map(t => {
            const player = players.find(p => p.id === t.player_id);
            return (
              <Card key={t.player_id} className={`flex items-center gap-3 ${t.is_winner ? 'ring-2 ring-yellow-400' : ''}`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-base" style={{ backgroundColor: (player?.color ?? '#6366f1') + '33' }}>
                  {player?.avatar_emoji ?? '🎲'}
                </div>
                <p className="flex-1 font-medium text-gray-800 dark:text-gray-100">{player?.name ?? 'Jugador'}</p>
                <span className="text-xl font-bold text-gray-900 dark:text-white">{t.grand_total}</span>
                {t.is_winner && <span>🏆</span>}
              </Card>
            );
          })}
        </div>

        <Button className="w-full" variant="secondary" onClick={() => navigate('/history')}>
          Ver historial
        </Button>
        <Button className="w-full" onClick={() => navigate('/session/new')}>
          Nueva partida
        </Button>
      </div>
    );
  }

  const currentPlayerId = session.player_ids[activePlayer];
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  const currentValues = roundInputs[currentPlayerId] ?? {};

  const setValues = (vals: InputValues) =>
    setRoundInputs(prev => ({ ...prev, [currentPlayerId]: vals }));

  const handleSubmit = () => {
    if (module.validate) {
      const err = module.validate(roundInputs[currentPlayerId] ?? {});
      if (err) { setError(err); return; }
    }
    setError(null);

    if (activePlayer < session.player_ids.length - 1) {
      setActivePlayer(prev => prev + 1);
      return;
    }

    const isDone = submitRound(roundInputs);
    setRoundInputs({});
    setActivePlayer(0);

    if (isDone) {
      const totals = withWinners(computePlayerTotals(
        { ...session, scores: [...session.scores] },
        module,
      ));
      endSession(totals.filter(t => t.is_winner).map(t => t.player_id));
    }
  };

  const isLastPlayer = activePlayer === session.player_ids.length - 1;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">{session.game_name}</h1>
          {module.metadata.scoring_mode === 'per_round' && (
            <p className="text-sm text-gray-400">
              Ronda {session.current_round}{module.metadata.total_rounds ? ` de ${module.metadata.total_rounds}` : ''}
            </p>
          )}
        </div>
        {module.metadata.scoring_mode === 'end_of_game' && (
          <Button variant="ghost" size="sm" onClick={() => {
            const totals = withWinners(computePlayerTotals(session, module));
            endSession(totals.filter(t => t.is_winner).map(t => t.player_id));
          }}>
            Terminar
          </Button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {session.player_ids.map((pid, i) => {
          const p = players.find(pl => pl.id === pid);
          return (
            <button
              key={pid}
              onClick={() => setActivePlayer(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm shrink-0 transition-all ${
                i === activePlayer
                  ? 'ring-2 ring-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                  : 'bg-gray-100 dark:bg-gray-700'
              }`}
            >
              <span>{p?.avatar_emoji ?? '🎲'}</span>
              <span className="font-medium text-gray-700 dark:text-gray-200">{p?.name ?? pid}</span>
              {roundInputs[pid] && <span className="text-green-500 text-xs">✓</span>}
            </button>
          );
        })}
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-base" style={{ backgroundColor: (currentPlayer?.color ?? '#6366f1') + '33' }}>
            {currentPlayer?.avatar_emoji ?? '🎲'}
          </div>
          <p className="font-semibold text-gray-800 dark:text-gray-100">{currentPlayer?.name ?? 'Jugador'}</p>
        </div>
        <InputRenderer
          inputs={module.inputs}
          values={currentValues}
          onChange={(id, val) => setValues({ ...currentValues, [id]: val })}
        />
        {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
      </Card>

      <Button
        className="w-full"
        size="lg"
        onClick={handleSubmit}
      >
        {isLastPlayer
          ? (module.metadata.scoring_mode === 'end_of_game' ? 'Calcular ganador' : 'Registrar ronda')
          : `Siguiente: ${players.find(p => p.id === session.player_ids[activePlayer + 1])?.name ?? '...'}`}
      </Button>

      {session.scores.length > 0 && module.metadata.scoring_mode === 'per_round' && (
        <ScoreTable session={session} module={module} players={players} />
      )}
    </div>
  );
}

function ScoreTable({ session, module, players }: { session: any; module: any; players: any[] }) {
  const totals = computePlayerTotals(session, module);
  return (
    <Card>
      <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Puntajes acumulados</p>
      <div className="space-y-2">
        {totals.sort((a, b) => b.grand_total - a.grand_total).map(t => {
          const p = players.find(pl => pl.id === t.player_id);
          return (
            <div key={t.player_id} className="flex items-center gap-3">
              <span className="text-sm">{p?.avatar_emoji ?? '🎲'}</span>
              <span className="flex-1 text-sm text-gray-700 dark:text-gray-200">{p?.name}</span>
              <span className="font-bold text-gray-900 dark:text-white">{t.grand_total}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
