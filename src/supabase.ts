import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// Accept either ANON_KEY or a PUBLISHABLE_KEY set in Vercel
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // In development show a simple warning; never print secrets or full env in logs.
  if (import.meta.env.DEV) {
    console.warn('Supabase credentials missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
  }
} else {
  // Avoid printing environment details in production. Keep minimal dev-only confirmation.
  if (import.meta.env.DEV) {
    console.info('Supabase client configured (dev mode).');
  }
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);
