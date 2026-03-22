import { createClient } from "@supabase/supabase-js";
import { requireEnv } from "@/lib/config";

export function createAdminClient() {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY", process.env.SUPABASE_SERVICE_ROLE_KEY),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
