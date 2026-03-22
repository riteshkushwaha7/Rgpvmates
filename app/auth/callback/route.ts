import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabase/server";
import { appConfig } from "@/lib/config";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/discover";

  if (code) {
    const supabase = await createServerSupabase();
    await supabase.auth.exchangeCodeForSession(code);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata.full_name || user.user_metadata.name || "",
        avatar_url: user.user_metadata.avatar_url || null,
        onboarding_completed: false,
      });
    }
  }

  return NextResponse.redirect(`${appConfig.siteUrl}${next}`);
}
