import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

console.log('[supabase] url:', url ?? 'MISSING', '| key prefix:', key ? key.slice(0, 20) : 'MISSING');

export const supabase = url && key ? createClient(url, key) : null;
