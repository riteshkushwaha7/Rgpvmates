import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { decryptMessage } from "@/lib/security";
import type {
  AdminStats,
  ContactRecord,
  MatchRecord,
  MessageRecord,
  PaymentRecord,
  ProfileRecord,
  ReportRecord,
} from "@/types/app";

export async function getDiscoverProfiles(userId: string) {
  const supabase = await createServerSupabase();

  const [{ data: swipes }, { data: profiles }] = await Promise.all([
    supabase.from("swipes").select("swiped_id").eq("swiper_id", userId),
    supabase
      .from("profiles")
      .select("*")
      .neq("id", userId)
      .eq("is_hidden", false)
      .eq("is_suspended", false)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const swipedIds = new Set((swipes || []).map((item) => item.swiped_id));

  return (profiles || []).filter((profile) => !swipedIds.has(profile.id)) as ProfileRecord[];
}

export async function getMatches(userId: string) {
  const supabase = await createServerSupabase();
  const { data: matches } = await supabase
    .from("matches")
    .select("id,user_a,user_b,created_at")
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (!matches?.length) return [] as MatchRecord[];

  const otherIds = matches.map((match) => (match.user_a === userId ? match.user_b : match.user_a));
  const { data: profiles } = await supabase.from("profiles").select("*").in("id", otherIds);

  return matches.map((match) => ({
    ...match,
    other_profile: profiles?.find((profile) => profile.id === (match.user_a === userId ? match.user_b : match.user_a)) as ProfileRecord | undefined,
  })) as MatchRecord[];
}

export async function getMatchMessages(matchId: string) {
  const supabase = await createServerSupabase();
  const { data: rows } = await supabase
    .from("messages")
    .select("id,match_id,sender_id,ciphertext,iv,auth_tag,created_at,read_at")
    .eq("match_id", matchId)
    .order("created_at", { ascending: true });

  return (rows || []).map((row) => ({
    id: row.id,
    match_id: row.match_id,
    sender_id: row.sender_id,
    content: decryptMessage({
      ciphertext: row.ciphertext,
      iv: row.iv,
      authTag: row.auth_tag,
    }),
    created_at: row.created_at,
    read_at: row.read_at,
  })) as MessageRecord[];
}

export async function getAdminStats() {
  const admin = createAdminClient();
  const [profilesResult, reportsResult, contactsResult, paymentsResult] = await Promise.all([
    admin.from("profiles").select("id,is_suspended,is_hidden,subscription_status"),
    admin.from("reports").select("id,status"),
    admin.from("contact_submissions").select("id,status"),
    admin.from("payments").select("id,amount,status"),
  ]);

  const profiles = profilesResult.data || [];
  const reports = reportsResult.data || [];
  const contacts = contactsResult.data || [];
  const payments = paymentsResult.data || [];

  return {
    totalUsers: profiles.length,
    activeUsers: profiles.filter((item) => !item.is_suspended).length,
    suspendedUsers: profiles.filter((item) => item.is_suspended).length,
    hiddenProfiles: profiles.filter((item) => item.is_hidden).length,
    openReports: reports.filter((item) => item.status !== "resolved").length,
    unresolvedContacts: contacts.filter((item) => item.status !== "resolved").length,
    activeSubscriptions: profiles.filter((item) => item.subscription_status === "active").length,
    totalRevenue: payments
      .filter((item) => item.status === "active")
      .reduce((sum, item) => sum + item.amount, 0),
  } satisfies AdminStats;
}

export async function getAdminUsers() {
  const admin = createAdminClient();
  const { data } = await admin.from("profiles").select("*").order("created_at", { ascending: false });
  return (data || []) as ProfileRecord[];
}

export async function getAdminReports() {
  const admin = createAdminClient();
  const { data } = await admin.from("reports").select("*").order("created_at", { ascending: false });
  return (data || []) as ReportRecord[];
}

export async function getAdminContacts() {
  const admin = createAdminClient();
  const { data } = await admin.from("contact_submissions").select("*").order("created_at", { ascending: false });
  return (data || []) as ContactRecord[];
}

export async function getAdminPayments() {
  const admin = createAdminClient();
  const { data } = await admin.from("payments").select("*").order("created_at", { ascending: false });
  return (data || []) as PaymentRecord[];
}
