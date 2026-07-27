import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// Accept either ANON_KEY or a PUBLISHABLE_KEY set in Vercel
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // In development show a simple warning; never print secrets or full env in logs.
  if (import.meta.env.DEV) {
    console.warn('Supabase credentials missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
  }
} else if (import.meta.env.DEV) {
  // Avoid printing environment details in production. Keep minimal dev-only confirmation.
  console.info('Supabase client configured (dev mode).');
}

/**
 * Temporary egress guard for the legacy Base64 photos stored in public.students.
 *
 * The current UI asks Supabase for `id,photoUrl` in automatic batches until it
 * has downloaded every student photo. With almost 200 Base64 images this sends
 * roughly 46 MB on every application visit. The guard answers only that exact
 * background batch request locally with null thumbnails, while normal student
 * queries and the single-record detail request continue to reach Supabase.
 *
 * Photos therefore remain available when a user explicitly opens a student's
 * record, but they are no longer downloaded automatically in the background.
 */
const egressGuardFetch: typeof fetch = async (input, init) => {
  const requestUrl = typeof input === 'string'
    ? input
    : input instanceof URL
      ? input.toString()
      : input.url;

  try {
    const url = new URL(requestUrl);
    const select = (url.searchParams.get('select') ?? '').replace(/\s/g, '').toLowerCase();
    const idFilter = url.searchParams.get('id') ?? '';
    const method = (init?.method ?? (input instanceof Request ? input.method : 'GET')).toUpperCase();
    const isAutomaticPhotoBatch =
      method === 'GET' &&
      url.pathname.endsWith('/rest/v1/students') &&
      select === 'id,photourl' &&
      idFilter.startsWith('in.(') &&
      idFilter.endsWith(')');

    if (isAutomaticPhotoBatch) {
      const ids = idFilter
        .slice(4, -1)
        .split(',')
        .map(id => id.trim().replace(/^"|"$/g, ''))
        .filter(Boolean);

      return new Response(
        JSON.stringify(ids.map(id => ({ id, photoUrl: null }))),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Cache-Control': 'no-store',
          },
        },
      );
    }
  } catch {
    // If URL parsing fails, preserve the normal Supabase request behavior.
  }

  return fetch(input, init);
};

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    global: {
      fetch: egressGuardFetch,
    },
  },
);
