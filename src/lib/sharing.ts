import { supabase } from './supabase';
import type { Session } from './types';

export async function syncSession(session: Session): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('shared_sessions')
    .upsert({ id: session.id, payload: session, updated_at: new Date().toISOString() });
  if (error) console.error('[sharing] sync failed:', error.message);
}

export async function startSharing(session: Session): Promise<{ url: string } | { error: string }> {
  if (!supabase) return { error: 'Sharing no configurado' };
  const { error } = await supabase
    .from('shared_sessions')
    .upsert({ id: session.id, payload: session, updated_at: new Date().toISOString() });
  if (error) return { error: error.message };
  return { url: `${window.location.origin}/share/${session.id}` };
}
