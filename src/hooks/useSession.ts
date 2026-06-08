import { useState, useCallback } from 'react';
import { sessionsStorage } from '../lib/storage';
import type { Session, InputValues, RoundScore, InputDef } from '../lib/types';
import { computeScore } from '../lib/sessionEngine';
import { getGameModule } from '../lib/gameLoader';

function getInputDefaults(inputs: InputDef[]): InputValues {
  return Object.fromEntries(
    inputs.map(inp => [inp.id, inp.default ?? (inp.type === 'toggle' ? false : 0)])
  );
}

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

    // Merge player inputs with defaults so score() always receives numbers, never undefined
    const defaults = getInputDefaults(module.inputs);
    const newScores: RoundScore[] = session.player_ids.map(player_id => {
      const values = { ...defaults, ...roundInputs[player_id] };
      return {
        player_id,
        round: session.current_round,
        raw_inputs: values,
        computed_score: computeScore(module, values, ctx),
      };
    });

    const allScores = [...session.scores, ...newScores];
    const nextRound = session.current_round + 1;
    const isDone =
      module.metadata.scoring_mode === 'end_of_game' ||
      (module.metadata.total_rounds != null && nextRound > module.metadata.total_rounds);

    // Compute winners from allScores now (fresh data) instead of stale session state
    let winner_ids: string[] | undefined;
    if (isDone) {
      const totals = session.player_ids.map(pid => ({
        player_id: pid,
        grand_total: allScores.filter(s => s.player_id === pid).reduce((sum, s) => sum + s.computed_score, 0),
      }));
      const max = Math.max(...totals.map(t => t.grand_total));
      winner_ids = totals.filter(t => t.grand_total === max).map(t => t.player_id);
    }

    sessionsStorage.update(session.id, {
      scores: allScores,
      current_round: isDone ? session.current_round : nextRound,
      status: isDone ? 'completed' : 'active',
      completed_at: isDone ? new Date().toISOString() : undefined,
      winner_ids,
    });
    refresh();
    return isDone;
  }, [session, refresh]);

  // Used by the manual "Terminar" button in end_of_game mode.
  // Reads scores directly from storage to avoid stale state.
  const endSession = useCallback(() => {
    if (!session) return;
    const fresh = sessionsStorage.getById(session.id);
    if (!fresh) return;
    const module = getGameModule(fresh.game_id);
    const totals = fresh.player_ids.map(pid => ({
      player_id: pid,
      grand_total: fresh.scores.filter(s => s.player_id === pid).reduce((sum, s) => sum + s.computed_score, 0),
    }));
    const max = totals.length > 0 ? Math.max(...totals.map(t => t.grand_total)) : 0;
    const winner_ids = totals.filter(t => t.grand_total === max).map(t => t.player_id);
    sessionsStorage.update(session.id, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      winner_ids,
    });
    void module; // module loaded for future use (e.g. tiebreaker)
    refresh();
  }, [session, refresh]);

  // Removes the last submitted round from storage and returns its raw_inputs
  // so the UI can pre-fill the form for re-entry.
  const undoLastRound = useCallback((): Record<string, InputValues> | null => {
    if (!session || session.current_round <= 1) return null;
    const prevRound = session.current_round - 1;

    const prevInputs: Record<string, InputValues> = {};
    session.player_ids.forEach(pid => {
      const score = session.scores.find(s => s.player_id === pid && s.round === prevRound);
      if (score) prevInputs[pid] = score.raw_inputs;
    });

    sessionsStorage.update(session.id, {
      scores: session.scores.filter(s => s.round !== prevRound),
      current_round: prevRound,
    });
    refresh();
    return prevInputs;
  }, [session, refresh]);

  return { session, createSession, submitRound, endSession, undoLastRound, refresh };
}
