import { useState, useCallback } from 'react';
import { sessionsStorage } from '../lib/storage';
import type { Session, InputValues, RoundScore } from '../lib/types';
import { computeScore } from '../lib/sessionEngine';
import { getGameModule } from '../lib/gameLoader';

function uuid() {
  return crypto.randomUUID();
}

export function useSession(sessionId: string | null) {
  const [session, setSession] = useState<Session | null>(() =>
    sessionId ? sessionsStorage.getById(sessionId) : sessionsStorage.getActive()
  );

  const refresh = useCallback(() => {
    const s = sessionId ? sessionsStorage.getById(sessionId) : sessionsStorage.getActive();
    setSession(s);
  }, [sessionId]);

  const createSession = useCallback((game_id: string, player_ids: string[]) => {
    const module = getGameModule(game_id);
    if (!module) throw new Error(`Game module not found: ${game_id}`);

    const active = sessionsStorage.getActive();
    if (active) {
      sessionsStorage.update(active.id, { status: 'abandoned' });
    }

    const newSession: Session = {
      id: uuid(),
      game_id,
      game_name: module.metadata.name,
      player_ids,
      status: 'active',
      current_round: 1,
      scores: [],
      started_at: new Date().toISOString(),
    };
    sessionsStorage.add(newSession);
    refresh();
    return newSession.id;
  }, [refresh]);

  const submitRound = useCallback((roundInputs: Record<string, InputValues>) => {
    if (!session) return;
    const module = getGameModule(session.game_id);
    if (!module) return;

    const ctx = {
      round: session.current_round,
      total_rounds: module.metadata.total_rounds,
    };

    const newScores: RoundScore[] = session.player_ids.map(player_id => ({
      player_id,
      round: session.current_round,
      raw_inputs: roundInputs[player_id] ?? {},
      computed_score: computeScore(module, roundInputs[player_id] ?? {}, ctx),
    }));

    const allScores = [...session.scores, ...newScores];
    const nextRound = session.current_round + 1;
    const isDone =
      module.metadata.scoring_mode === 'end_of_game' ||
      (module.metadata.total_rounds != null && nextRound > module.metadata.total_rounds);

    sessionsStorage.update(session.id, {
      scores: allScores,
      current_round: isDone ? session.current_round : nextRound,
      status: isDone ? 'completed' : 'active',
      completed_at: isDone ? new Date().toISOString() : undefined,
    });
    refresh();
    return isDone;
  }, [session, refresh]);

  const endSession = useCallback((winner_ids: string[]) => {
    if (!session) return;
    sessionsStorage.update(session.id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      winner_ids,
    });
    refresh();
  }, [session, refresh]);

  return { session, createSession, submitRound, endSession, refresh };
}
