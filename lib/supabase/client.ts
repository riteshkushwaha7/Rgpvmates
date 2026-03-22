import { createBrowserClient } from "@supabase/ssr";
import { appConfig } from "@/lib/config";

let client: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  if (!client) {
    client = createBrowserClient(appConfig.supabaseUrl, appConfig.supabaseAnonKey);
  }

  return client;
}
