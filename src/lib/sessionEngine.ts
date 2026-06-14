import type { Session, PlayerTotals, Player } from './types';
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

export function resolvePlayerName(playerId: string, players: Player[], session: Session): string {
  return players.find(p => p.id === playerId)?.name
    ?? session.player_name_snapshots?.[playerId]
    ?? 'Desconocido';
}

export function computeStreak(sessions: Session[], playerId: string): { count: number; type: 'win' | 'loss' | 'none' } {
  const played = sessions
    .filter(s => s.status === 'completed' && s.player_ids.includes(playerId))
    .sort((a, b) => new Date(b.completed_at ?? b.started_at).getTime() - new Date(a.completed_at ?? a.started_at).getTime());

  if (played.length === 0) return { count: 0, type: 'none' };

  const firstIsWin = (played[0].winner_ids ?? []).includes(playerId);
  let count = 0;
  for (const s of played) {
    const isWin = (s.winner_ids ?? []).includes(playerId);
    if (isWin === firstIsWin) count++;
    else break;
  }
  return { count, type: firstIsWin ? 'win' : 'loss' };
}

export function computeHeadToHead(
  playerId: string,
  sessions: Session[],
): { opponentId: string; wins: number; losses: number; total: number }[] {
  const completed = sessions.filter(s => s.status === 'completed' && s.player_ids.includes(playerId));
  const h2h: Record<string, { wins: number; losses: number }> = {};
  for (const s of completed) {
    const isWin = (s.winner_ids ?? []).includes(playerId);
    for (const opponentId of s.player_ids) {
      if (opponentId === playerId) continue;
      if (!h2h[opponentId]) h2h[opponentId] = { wins: 0, losses: 0 };
      if (isWin) h2h[opponentId].wins++;
      else h2h[opponentId].losses++;
    }
  }
  return Object.entries(h2h)
    .map(([opponentId, { wins, losses }]) => ({ opponentId, wins, losses, total: wins + losses }))
    .sort((a, b) => b.total - a.total);
}

export function computeGameStats(
  playerId: string,
  sessions: Session[],
): { gameId: string; gameName: string; played: number; won: number; winRate: number }[] {
  const completed = sessions.filter(s => s.status === 'completed' && s.player_ids.includes(playerId));
  const stats: Record<string, { gameName: string; played: number; won: number }> = {};
  for (const s of completed) {
    if (!stats[s.game_id]) stats[s.game_id] = { gameName: s.game_name, played: 0, won: 0 };
    stats[s.game_id].played++;
    if ((s.winner_ids ?? []).includes(playerId)) stats[s.game_id].won++;
  }
  return Object.entries(stats)
    .map(([gameId, { gameName, played, won }]) => ({
      gameId, gameName, played, won, winRate: Math.round((won / played) * 100),
    }))
    .sort((a, b) => b.played - a.played);
}

export function computeEloHistory(
  playerId: string,
  sessions: Session[],
): { elo: number; game_name: string; date: string }[] {
  const history: { elo: number; game_name: string; date: string }[] = [];
  const ratings: Record<string, number> = {};
  const K = 32;

  const completed = [...sessions]
    .filter(s => s.status === 'completed')
    .sort((a, b) =>
      new Date(a.completed_at ?? a.started_at).getTime() -
      new Date(b.completed_at ?? b.started_at).getTime()
    );

  for (const session of completed) {
    const pids = session.player_ids;
    const n = pids.length;
    if (n < 2) continue;
    for (const pid of pids) if (!(pid in ratings)) ratings[pid] = 1000;

    const winners = new Set(session.winner_ids ?? []);
    const changes: Record<string, number> = {};
    for (const pid of pids) changes[pid] = 0;

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = pids[i], b = pids[j];
        const Ea = 1 / (1 + Math.pow(10, (ratings[b] - ratings[a]) / 400));
        const aWon = winners.has(a), bWon = winners.has(b);
        const Sa = (aWon && bWon) ? 0.5 : aWon ? 1 : bWon ? 0 : 0.5;
        const delta = (K * (Sa - Ea)) / (n - 1);
        changes[a] += delta;
        changes[b] -= delta;
      }
    }

    for (const pid of pids) ratings[pid] = Math.round(ratings[pid] + changes[pid]);

    if (pids.includes(playerId)) {
      history.push({
        elo: ratings[playerId],
        game_name: session.game_name,
        date: session.completed_at ?? session.started_at,
      });
    }
  }

  return history;
}

// Multiplayer ELO: pairwise comparisons, K=32 divided by (n-1) to normalize.
// Winners beat non-winners (1-0), co-winners tie (0.5), non-winners tie (0.5).
export function computeEloRatings(sessions: Session[]): Record<string, number> {
  const ratings: Record<string, number> = {};
  const K = 32;

  const completed = [...sessions]
    .filter(s => s.status === 'completed')
    .sort((a, b) =>
      new Date(a.completed_at ?? a.started_at).getTime() -
      new Date(b.completed_at ?? b.started_at).getTime()
    );

  for (const session of completed) {
    const pids = session.player_ids;
    const n = pids.length;
    if (n < 2) continue;

    for (const pid of pids) {
      if (!(pid in ratings)) ratings[pid] = 1000;
    }

    const winners = new Set(session.winner_ids ?? []);
    const changes: Record<string, number> = {};
    for (const pid of pids) changes[pid] = 0;

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const a = pids[i];
        const b = pids[j];
        const Ra = ratings[a];
        const Rb = ratings[b];
        const Ea = 1 / (1 + Math.pow(10, (Rb - Ra) / 400));

        const aWon = winners.has(a);
        const bWon = winners.has(b);
        let Sa: number;
        if (aWon && bWon) Sa = 0.5;
        else if (aWon) Sa = 1;
        else if (bWon) Sa = 0;
        else Sa = 0.5;

        const delta = (K * (Sa - Ea)) / (n - 1);
        changes[a] += delta;
        changes[b] -= delta;
      }
    }

    for (const pid of pids) {
      ratings[pid] = Math.round(ratings[pid] + changes[pid]);
    }
  }

  return ratings;
}
