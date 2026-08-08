import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Falta ${name}. Configura las variables de Supabase en .env.local`,
    );
  }
  return value;
}

export function getSupabaseUrl(): string {
  const raw = requireEnv("NEXT_PUBLIC_SUPABASE_URL").trim();
  // Solo el origen del proyecto: sin /rest/v1 ni slash final
  return raw.replace(/\/+$/, "").replace(/\/rest\/v1$/i, "");
}

/** Cliente público (lectura). */
export function createAnonClient(): SupabaseClient {
  return createClient(
    getSupabaseUrl(),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}

/** Cliente con service role (escrituras + storage desde el server). */
export function createServiceClient(): SupabaseClient {
  return createClient(
    getSupabaseUrl(),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: { persistSession: false, autoRefreshToken: false },
    },
  );
}

export {
  MEDIA_BUCKETS,
  isMediaBucket,
  type MediaBucket,
} from "@/lib/supabase/buckets";

export function publicStorageUrl(bucket: string, path: string): string {
  const base = getSupabaseUrl().replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${bucket}/${path}`;
}
