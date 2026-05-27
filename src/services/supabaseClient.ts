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
export async function safeFetchSupabaseTable<T = any>(
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

/**
 * Universal safe inserter for Supabase tables.
 */
export async function safeInsertSupabaseRecord<T = any>(
  tableName: string,
  record: any
): Promise<T | null> {
  if (!isSupabaseConfigured()) {
    console.log(`[Supabase] Blocked insert on '${tableName}'. Live database credentials not set up.`);
    return null;
  }

  try {
    const { data, error } = await supabase
      .from(tableName)
      .insert(record)
      .select('*')
      .single();

    if (error) {
      console.error(`[Supabase] Insert error in table '${tableName}':`, error.message);
      return null;
    }

    return data as T;
  } catch (err) {
    console.error(`[Supabase] Exception when inserting into table '${tableName}':`, err);
    return null;
  }
}

/**
 * Helper to update any record by ID
 */
export async function safeUpdateSupabaseRecord(
  tableName: string,
  id: string,
  updatedFields: any
): Promise<any | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase
      .from(tableName)
      .update(updatedFields)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.warn(`[Supabase] Update failed on '${tableName}':`, error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.warn(`[Supabase] Exception updating record on '${tableName}':`, err);
    return null;
  }
}

/**
 * Safe Image Upload: converts image File to Base64 Data URL so it is fully stored inside the database 
 * or tries uploading directly to Supabase Storage Bucket 'animal-rescue-assets' with safe fallback.
 */
export async function uploadRescueImage(file: File): Promise<string> {
  // Convert always to base64 as the absolute fallback for frictionless previewing
  const convertToBase64 = (f: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(f);
    });
  };

  const base64Url = await convertToBase64(file);

  if (!isSupabaseConfigured()) {
    return base64Url;
  }

  try {
    // Attempt standard storage upload if bucket is provisioned, else fallback safely to Base64
    const fileExt = file.name.split('.').pop() || 'png';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(3)}.${fileExt}`;
    const filePath = `reports/${fileName}`;

    const { data, error } = await supabase.storage
      .from('animal-rescue-assets')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (error) {
      console.log('[Supabase Storage] Skipped bucket upload (Relying on Base64 encoding):', error.message);
      return base64Url;
    }

    // Retrieve public URL
    const { data: publicData } = supabase.storage
      .from('animal-rescue-assets')
      .getPublicUrl(filePath);

    return publicData?.publicUrl || base64Url;
  } catch (err) {
    console.log('[Supabase Storage] Exception uploading, using Base64 URI fallback instead:', err);
    return base64Url;
  }
}
