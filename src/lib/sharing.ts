import { supabase, supabaseDiag } from './supabase';
import type { Session } from './types';

export async function syncSession(session: Session): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('shared_sessions')
    .upsert({ id: session.id, payload: session, updated_at: new Date().toISOString() });
  if (error) console.error('[sharing] sync failed:', error.message);
}

export async function startSharing(session: Session): Promise<{ url: string } | { error: string }> {
  if (!supabase) return { error: `Supabase null — url:${supabaseDiag.url} key:${supabaseDiag.keyPrefix}` };
  const { error } = await supabase
    .from('shared_sessions')
    .upsert({ id: session.id, payload: session, updated_at: new Date().toISOString() });
  if (error) {
    return { error: `[${error.code ?? 'no-code'}] ${error.message} | url:${supabaseDiag.url.slice(8, 40)} key:${supabaseDiag.keyPrefix}` };
  }
  return { url: `${window.location.origin}/share/${session.id}` };
}
