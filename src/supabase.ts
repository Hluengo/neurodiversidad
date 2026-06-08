import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// Accept either ANON_KEY or a PUBLISHABLE_KEY set in Vercel
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials missing. Please check your .env file.', {
    VITE_SUPABASE_URL: supabaseUrl,
    VITE_SUPABASE_ANON_KEY_present: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_SUPABASE_PUBLISHABLE_KEY_present: !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  });
} else {
  // Informational log (temporary) to confirm which variables are being used in the client
  console.info('Supabase env (client):', {
    VITE_SUPABASE_URL: supabaseUrl,
    usedAnonKeySource: import.meta.env.VITE_SUPABASE_ANON_KEY ? 'VITE_SUPABASE_ANON_KEY' : (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'VITE_SUPABASE_PUBLISHABLE_KEY' : 'none'),
  });
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);
