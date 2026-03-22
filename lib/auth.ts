import { redirect } from "next/navigation";
import { cache } from "react";
import { createServerSupabase } from "@/lib/supabase/server";
import type { ProfileRecord } from "@/types/app";

export const getSessionProfile = cache(async () => {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null as ProfileRecord | null };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { user, profile: (profile as ProfileRecord | null) ?? null };
});

export async function requireUser() {
  const result = await getSessionProfile();
  if (!result.user) {
    redirect("/signin");
  }

  if (result.profile?.is_suspended) {
    redirect("/suspended");
  }

  return result;
}

export async function requireAdmin() {
  const result = await requireUser();
  if (!result.profile?.is_admin) {
    redirect("/discover");
  }
  return result;
}
