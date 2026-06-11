import { supabase } from './supabase';
import type { Session } from './types';

export async function syncSession(session: Session): Promise<void> {
  if (!supabase) return;
  await supabase
    .from('shared_sessions')
    .upsert({ id: session.id, payload: session, updated_at: new Date().toISOString() });
}

export async function startSharing(session: Session): Promise<string | null> {
  if (!supabase) return null;
  await syncSession(session);
  return `${window.location.origin}/share/${session.id}`;
}
