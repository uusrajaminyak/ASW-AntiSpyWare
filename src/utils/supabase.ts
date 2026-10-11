import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Return a dummy client if env vars are not set (for UI preview without backend)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const client: any =
  !supabaseUrl || supabaseUrl.includes('placeholder')
    ? {
        from: () => ({
          select: () => ({ order: () => ({ limit: () => ({ data: [] }) }) }),
        }),
        channel: () => ({ on: () => ({ subscribe: () => {} }) }),
        removeChannel: () => {},
      }
    : createClient(supabaseUrl, supabaseAnonKey);

export const supabase = client;
