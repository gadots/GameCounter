import { useCallback, useSyncExternalStore } from 'react';
import { sessionsStorage, playersStorage } from '../lib/storage';
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

// Reactive read-only access to all sessions. Re-renders subscribers whenever
// the sessions store changes (including cross-tab), without re-parsing
// localStorage on every render.
export function useSessions() {
  return useSyncExternalStore(sessionsStorage.subscribe, sessionsStorage.getAll);
}

export function useSession(sessionId: string | null) {
  const getSnapshot = useCallback(
    () => (sessionId ? sessionsStorage.getById(sessionId) : sessionsStorage.getActive()),
    [sessionId],
  );
  const session = useSyncExternalStore(sessionsStorage.subscribe, getSnapshot);

  const createSession = useCallback((game_id: string, player_ids: string[], mode_id?: string) => {
    const module = getGameModule(game_id);
    if (!module) throw new Error(`Game module not found: ${game_id}`);

    const active = sessionsStorage.getActive();
    if (active) {
      sessionsStorage.update(active.id, { status: 'abandoned' });
    }

    const allPlayers = playersStorage.getAll();
    const player_name_snapshots: Record<string, string> = {};
    player_ids.forEach(pid => {
      const p = allPlayers.find(pl => pl.id === pid);
      if (p) player_name_snapshots[pid] = p.name;
    });

    const resolvedMode = mode_id
      ?? module.metadata.default_mode
      ?? module.metadata.modes?.[0]?.id;

    const newSession: Session = {
      id: uuid(),
      game_id,
      game_name: module.metadata.name,
      player_ids,
      status: 'active',
      current_round: 1,
      scores: [],
      started_at: new Date().toISOString(),
      player_name_snapshots,
      mode_id: resolvedMode,
    };
    sessionsStorage.add(newSession);
    return newSession.id;
  }, []);

  const submitRound = useCallback((roundInputs: Record<string, InputValues>) => {
    if (!session) return;
    const module = getGameModule(session.game_id);
    if (!module) return;

    const isFinalBonus = session.in_final_bonus ?? false;
    const modeInputs = module.getInputs?.(session.mode_id ?? '') ?? module.inputs;
    const activeInputs = isFinalBonus ? module.final_round!.inputs : modeInputs;
    const ctx = { round: session.current_round, total_rounds: module.metadata.total_rounds, mode_id: session.mode_id };

    // Merge player inputs with defaults so score() always receives numbers, never undefined
    const defaults = getInputDefaults(activeInputs);
    const newScores: RoundScore[] = session.player_ids.map(player_id => {
      const values = { ...defaults, ...roundInputs[player_id] };
      return {
        player_id,
        round: session.current_round,
        raw_inputs: values,
        computed_score: isFinalBonus
          ? module.final_round!.score(values)
          : computeScore(module, values, ctx),
      };
    });

    const allScores = [...session.scores, ...newScores];
    const nextRound = session.current_round + 1;
    const total = module.metadata.total_rounds;

    // Done when: end_of_game mode, or just submitted the bonus round,
    // or all rounds done and no final_round exists.
    const isDone =
      module.metadata.scoring_mode === 'end_of_game' ||
      isFinalBonus ||
      (total != null && nextRound > total && !module.final_round);

    // For fixed-round games: auto-enter bonus mode after the last regular round.
    const enterBonus = !isDone && !isFinalBonus && total != null && nextRound > total && !!module.final_round;

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
      in_final_bonus: enterBonus || undefined,
    });
    return isDone;
  }, [session]);

  // Manually trigger the final bonus round for variable-round games.
  const enterFinalBonus = useCallback(() => {
    if (!session) return;
    sessionsStorage.update(session.id, { in_final_bonus: true });
  }, [session]);

  // Used by the manual "Terminar" button in end_of_game mode.
  // Reads scores directly from storage to avoid stale state.
  const endSession = useCallback(() => {
    if (!session) return;
    const fresh = sessionsStorage.getById(session.id);
    if (!fresh) return;
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
  }, [session]);

  // Removes the last submitted round from storage and returns its raw_inputs
  // so the UI can pre-fill the form for re-entry.
  // When in bonus mode: exits bonus mode and (for fixed-round games) undoes the
  // last regular round so the player can re-enter it.
  const undoLastRound = useCallback((): Record<string, InputValues> | null => {
    if (!session) return null;

    if (session.in_final_bonus) {
      const module = getGameModule(session.game_id);
      const total = module?.metadata.total_rounds;
      if (total != null) {
        // Fixed-round game: undo last regular round so user can re-enter it.
        const prevInputs: Record<string, InputValues> = {};
        session.player_ids.forEach(pid => {
          const score = session.scores.find(s => s.player_id === pid && s.round === total);
          if (score) prevInputs[pid] = score.raw_inputs;
        });
        sessionsStorage.update(session.id, {
          scores: session.scores.filter(s => s.round !== total),
          current_round: total,
          in_final_bonus: undefined,
        });
        return prevInputs;
      }
      // Variable-round game: just cancel bonus mode, nothing to undo.
      sessionsStorage.update(session.id, { in_final_bonus: undefined });
      return {};
    }

    if (session.current_round <= 1) return null;
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
    return prevInputs;
  }, [session]);

  return { session, createSession, submitRound, endSession, undoLastRound, enterFinalBonus };
}
