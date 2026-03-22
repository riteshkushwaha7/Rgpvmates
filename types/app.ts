export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Gender = "man" | "woman" | "non-binary" | "prefer-not-to-say";
export type SwipeAction = "like" | "pass";
export type SubscriptionPlan = "free" | "monthly" | "yearly";
export type SubscriptionStatus = "inactive" | "active" | "expired" | "failed";
export type ReportStatus = "open" | "reviewing" | "resolved";

export interface ProfileRecord {
  id: string;
  email?: string | null;
  full_name: string | null;
  age: number | null;
  gender: Gender | null;
  city: string | null;
  bio: string | null;
  interests: string[] | null;
  avatar_url: string | null;
  photos: string[] | null;
  is_admin: boolean;
  is_hidden: boolean;
  is_suspended: boolean;
  suspension_reason: string | null;
  onboarding_completed: boolean;
  subscription_plan: SubscriptionPlan;
  subscription_status: SubscriptionStatus;
  subscription_ends_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DiscoverCard extends ProfileRecord {
  compatibility_label?: string;
}

export interface MatchRecord {
  id: string;
  user_a: string;
  user_b: string;
  created_at: string;
  other_profile?: ProfileRecord;
}

export interface MessageRecord {
  id: string;
  match_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

export interface ReportRecord {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  category: string;
  details: string | null;
  status: ReportStatus;
  created_at: string;
}

export interface ContactRecord {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ReportStatus;
  created_at: string;
}

export interface PaymentRecord {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  amount: number;
  currency: string;
  status: SubscriptionStatus;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  period_start: string | null;
  period_end: string | null;
  created_at: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  hiddenProfiles: number;
  openReports: number;
  unresolvedContacts: number;
  activeSubscriptions: number;
  totalRevenue: number;
}
