import { createClient } from '@supabase/supabase-js';

// Load Supabase credentials dynamically from environment
const rawSupabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const rawSupabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

// If credentials are empty or contain placeholders, use a safe indicator
export const isSupabaseConfigured = (): boolean => {
  return (
    Boolean(rawSupabaseUrl) &&
    rawSupabaseUrl.includes('supabase.co') &&
    Boolean(rawSupabaseAnonKey) &&
    rawSupabaseAnonKey.length > 20
  );
};

// Safe fallback placeholder client to avoid throwing on module load
const supabaseUrl = isSupabaseConfigured() ? rawSupabaseUrl : 'https://dummy-project-id.supabase.co';
const supabaseAnonKey = isSupabaseConfigured() ? rawSupabaseAnonKey : 'dummy-anon-key-that-is-long-enough-to-be-parsed-correctly';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface SupabaseRecord {
  id: string;
  name: string;
  type: string;
  city: string;
  state: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  email?: string;
  website?: string;
  emergency_available: boolean;
  opening_hours?: string;
  verified_status?: string; // 'Verified', 'Approved', etc.
  service_tags?: string[];
  created_at?: string;
}

/**
 * Universal safe fetcher for any Supabase table.
 * Gracefully returns null if table doesn't exist, has no permission, or Supabase is not configured.
 */
export async function safeFetchSupabaseTable<T = SupabaseRecord>(
  tableName: string
): Promise<T[] | null> {
  if (!isSupabaseConfigured()) {
    console.log(`[Supabase] Table '${tableName}' fetch skipped. Credentials not fully configured.`);
    return null;
  }

  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn(`[Supabase] Errored while querying '${tableName}':`, error.message);
      return null;
    }

    return data as T[];
  } catch (err) {
    console.warn(`[Supabase] Exception when fetching table '${tableName}':`, err);
    return null;
  }
}
