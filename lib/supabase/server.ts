import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { appConfig } from "@/lib/config";

export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(appConfig.supabaseUrl, appConfig.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      },
    },
  });
}
