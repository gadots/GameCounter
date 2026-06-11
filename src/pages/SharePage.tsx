import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import type { Session } from '../lib/types';

function computeTotals(session: Session) {
  return session.player_ids.map(player_id => {
    const grand_total = session.scores
      .filter(s => s.player_id === player_id)
      .reduce((sum, s) => sum + s.computed_score, 0);
    const isWinner = (session.winner_ids ?? []).includes(player_id);
    return { player_id, grand_total, isWinner };
  });
}

export function SharePage() {
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !supabase) { setLoading(false); return; }

    supabase
      .from('shared_sessions')
      .select('payload')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) setSession(data.payload as Session);
        setLoading(false);
      });

    const channel = supabase
      .channel(`share:${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shared_sessions', filter: `id=eq.${id}` },
        (payload) => {
          const row = payload.new as { payload: Session };
          if (row?.payload) setSession(row.payload);
        }
      )
      .subscribe();

    return () => { supabase!.removeChannel(channel); };
  }, [id]);

  if (!supabase) {
    return <div className="p-4 text-gray-400">Sharing no configurado.</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Conectando...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">Partida no encontrada.</p>
      </div>
    );
  }

  const totals = computeTotals(session).sort((a, b) => b.grand_total - a.grand_total);
  const isCompleted = session.status === 'completed';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-lg mx-auto p-4 space-y-4">
        <div className="text-center pt-6 pb-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{session.game_name}</h1>
          <p className="text-sm text-gray-400 mt-1">
            {isCompleted
              ? 'Partida terminada'
              : `Ronda ${session.current_round}${session.scores.length === 0 ? ' — esperando primera ronda...' : ''}`
            }
          </p>
        </div>

        {isCompleted && totals.some(t => t.isWinner) && (
          <div className="text-center py-2">
            <div className="text-4xl mb-2">🏆</div>
            <p className="font-bold text-gray-900 dark:text-white text-lg">
              {totals.filter(t => t.isWinner).map(t => session.player_name_snapshots?.[t.player_id] ?? t.player_id).join(', ')}
            </p>
          </div>
        )}

        <Card>
          <p className="text-xs font-semibold text-gray-400 uppercase mb-3">Marcador</p>
          <div className="space-y-3">
            {totals.map((t, i) => {
              const name = session.player_name_snapshots?.[t.player_id] ?? t.player_id;
              return (
                <div
                  key={t.player_id}
                  className={`flex items-center gap-3 ${isCompleted && t.isWinner ? 'font-bold' : ''}`}
                >
                  <span className="text-gray-400 text-sm w-4 shrink-0">{i + 1}</span>
                  <span className="flex-1 text-gray-800 dark:text-gray-100 truncate">{name}</span>
                  {isCompleted && t.isWinner && <span>🏆</span>}
                  <span className={`text-lg font-bold shrink-0 ${t.grand_total < 0 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                    {t.grand_total}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        <p className="text-xs text-center text-gray-400 py-2">
          {isCompleted ? 'Resultado final' : '🔴 En vivo · se actualiza automáticamente'}
        </p>
      </div>
    </div>
  );
}
