import { NextResponse } from "next/server";
import { appConfig } from "@/lib/config";
import { assertRateLimit } from "@/lib/rate-limit";
import { createServerSupabase } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  assertRateLimit(`google-login:${ip}`, 12, 60_000);

  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${appConfig.siteUrl}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(`${appConfig.siteUrl}/signin?error=auth`);
  }

  return NextResponse.redirect(data.url);
}
