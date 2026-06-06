import type { Session, PlayerTotals } from './types';
import type { GameModule } from './types';

export function computePlayerTotals(session: Session, _module: GameModule): PlayerTotals[] {
  return session.player_ids.map(player_id => {
    const rounds = session.scores
      .filter(s => s.player_id === player_id)
      .sort((a, b) => a.round - b.round);

    const round_scores = rounds.map(r => r.computed_score);
    const grand_total = round_scores.reduce((sum, s) => sum + s, 0);

    return { player_id, round_scores, grand_total, is_winner: false };
  });
}

export function determineWinners(totals: PlayerTotals[]): string[] {
  if (totals.length === 0) return [];
  const max = Math.max(...totals.map(t => t.grand_total));
  return totals.filter(t => t.grand_total === max).map(t => t.player_id);
}

export function computeScore(
  gameModule: GameModule,
  values: Record<string, number | boolean>,
  ctx: { round: number; total_rounds?: number },
): number {
  return gameModule.score(values, ctx);
}

export function isTargetReached(totals: PlayerTotals[], gameModule: GameModule): boolean {
  const target = gameModule.metadata.target_score;
  if (target == null) return false;
  return totals.some(t => t.grand_total >= target);
}

export function withWinners(totals: PlayerTotals[]): PlayerTotals[] {
  const winnerIds = new Set(determineWinners(totals));
  return totals.map(t => ({ ...t, is_winner: winnerIds.has(t.player_id) }));
}
