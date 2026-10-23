import { createClient } from '@supabase/supabase-js';

// Supabase URL & Anon Key from Vite environment variables or defaults provided
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://gklvxmakdeossulitiim.supabase.co';

export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_1PiRW3g-CLpJiCgWKlzzag_0cgZOfoI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface ConnectionStatus {
  connected: boolean;
  message: string;
  hasTables: boolean;
  timestamp: string;
}

/**
 * Checks if Supabase is reachable and whether the app tables exist.
 */
export async function checkSupabaseConnection(): Promise<ConnectionStatus> {
  const timestamp = new Date().toISOString();
  try {
    // 1. Check basic endpoint accessibility via Auth getSession
    const { error: authError } = await supabase.auth.getSession();
    if (authError) {
      return {
        connected: false,
        message: `Supabase auth unreachable: ${authError.message}`,
        hasTables: false,
        timestamp,
      };
    }

    // 2. Test query to check if public.listings table exists
    const { error: tableError } = await supabase.from('listings').select('id').limit(1);

    if (tableError) {
      // PGRST205 means table doesn't exist yet, but connection & credentials are valid!
      if (tableError.code === 'PGRST205' || tableError.message?.includes('schema cache')) {
        return {
          connected: true,
          message: 'Connected to Supabase! (Database tables pending initial SQL schema setup)',
          hasTables: false,
          timestamp,
        };
      }
      return {
        connected: true,
        message: `Connected, query status: ${tableError.message}`,
        hasTables: false,
        timestamp,
      };
    }

    return {
      connected: true,
      message: 'Connected to Supabase! Tables are online and ready.',
      hasTables: true,
      timestamp,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      connected: false,
      message: `Failed to connect: ${errorMsg}`,
      hasTables: false,
      timestamp,
    };
  }
}
