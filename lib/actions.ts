"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import Razorpay from "razorpay";
import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { appConfig, requireEnv } from "@/lib/config";
import { assertRateLimit } from "@/lib/rate-limit";
import { encryptMessage } from "@/lib/security";
import {
  contactSchema,
  messageSchema,
  onboardingSchema,
  paymentIntentSchema,
  reportSchema,
} from "@/lib/validators";
import { clampText } from "@/lib/utils";

export async function submitContact(formData: FormData) {
  const payload = contactSchema.parse({
    name: String(formData.get("name") || ""),
    email: String(formData.get("email") || ""),
    subject: String(formData.get("subject") || ""),
    message: String(formData.get("message") || ""),
  });

  assertRateLimit(`contact:${payload.email}`, 3, 60_000);

  const admin = createAdminClient();
  await admin.from("contact_submissions").insert({
    name: payload.name,
    email: payload.email,
    subject: payload.subject,
    message: payload.message,
    status: "open",
  });

  redirect("/contact?submitted=1");
}

export async function completeOnboarding(formData: FormData) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin");

  const payload = onboardingSchema.parse({
    fullName: String(formData.get("fullName") || ""),
    age: Number(formData.get("age")),
    isAdultConfirmed: formData.get("isAdultConfirmed") === "on",
    gender: String(formData.get("gender") || ""),
    city: String(formData.get("city") || ""),
    bio: String(formData.get("bio") || ""),
    interests: formData.getAll("interests").map((item) => String(item)),
  }) as {
    fullName: string;
    age: number;
    gender: string;
    city: string;
    bio: string;
    interests: string[];
  };

  assertRateLimit(`profile:${user.id}`, 10, 60_000);

  await supabase.from("profiles").upsert({
    id: user.id,
    email: user.email,
    full_name: clampText(payload.fullName, 80),
    age: payload.age,
    gender: payload.gender,
    city: clampText(payload.city, 80),
    bio: clampText(payload.bio, 280),
    interests: payload.interests,
    onboarding_completed: true,
    updated_at: new Date().toISOString(),
  });

  redirect("/discover");
}

export async function saveProfileDetails(formData: FormData) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const payload = onboardingSchema.parse({
    fullName: String(formData.get("fullName") || ""),
    age: Number(formData.get("age")),
    isAdultConfirmed: true,
    gender: String(formData.get("gender") || ""),
    city: String(formData.get("city") || ""),
    bio: String(formData.get("bio") || ""),
    interests: formData.getAll("interests").map((item) => String(item)),
  }) as {
    fullName: string;
    age: number;
    gender: string;
    city: string;
    bio: string;
    interests: string[];
  };

  assertRateLimit(`profile:${user.id}`, 10, 60_000);

  await supabase
    .from("profiles")
    .update({
      full_name: clampText(payload.fullName, 80),
      age: payload.age,
      gender: payload.gender,
      city: clampText(payload.city, 80),
      bio: clampText(payload.bio, 280),
      interests: payload.interests,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  revalidatePath("/profile");
  revalidatePath("/settings");
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Please choose an image");
  }

  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
    throw new Error("Only JPG, PNG, or WebP images up to 5MB are allowed");
  }

  const extension = file.name.split(".").pop() || "jpg";
  const path = `${user.id}/avatar-${Date.now()}.${extension}`;
  const admin = createAdminClient();

  await admin.storage.from("profile-media").upload(path, file, {
    contentType: file.type,
    upsert: true,
  });

  const { data } = admin.storage.from("profile-media").getPublicUrl(path);

  await admin.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", user.id);

  revalidatePath("/profile");
  revalidatePath("/settings");
  revalidatePath("/discover");
}

export async function toggleVisibility(hidden: boolean) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  await supabase.from("profiles").update({ is_hidden: hidden }).eq("id", user.id);
  revalidatePath("/profile");
  revalidatePath("/discover");
}

export async function deleteOwnAccount() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const admin = createAdminClient();
  await admin.auth.admin.deleteUser(user.id);
  redirect("/");
}

export async function reportUser(formData: FormData) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const payload = reportSchema.parse({
    reportedUserId: String(formData.get("reportedUserId") || ""),
    category: String(formData.get("category") || ""),
    details: String(formData.get("details") || ""),
  }) as { reportedUserId: string; category: string; details?: string };

  await supabase.from("reports").insert({
    reporter_id: user.id,
    reported_user_id: payload.reportedUserId,
    category: payload.category,
    details: payload.details || null,
    status: "open",
  });

  revalidatePath("/discover");
}

export async function blockUser(blockedUserId: string) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  await supabase.from("blocks").upsert({ blocker_id: user.id, blocked_user_id: blockedUserId });
  revalidatePath("/discover");
}

export async function swipeProfile(swipedUserId: string, action: "like" | "pass") {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  await supabase.from("swipes").upsert({
    swiper_id: user.id,
    swiped_id: swipedUserId,
    action,
  });

  if (action === "like") {
    const { data: reciprocal } = await supabase
      .from("swipes")
      .select("id")
      .eq("swiper_id", swipedUserId)
      .eq("swiped_id", user.id)
      .eq("action", "like")
      .maybeSingle();

    if (reciprocal) {
      const userA = [user.id, swipedUserId].sort()[0];
      const userB = [user.id, swipedUserId].sort()[1];
      await supabase.from("matches").upsert({ user_a: userA, user_b: userB });
    }
  }

  revalidatePath("/discover");
  revalidatePath("/matches");
}

export async function sendMessage(formData: FormData) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const payload = messageSchema.parse({
    matchId: String(formData.get("matchId") || ""),
    content: String(formData.get("content") || ""),
  }) as { matchId: string; content: string };

  assertRateLimit(`message:${user.id}`, 20, 60_000);

  const { data: match } = await supabase
    .from("matches")
    .select("id")
    .eq("id", payload.matchId)
    .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
    .maybeSingle();

  if (!match) {
    throw new Error("Chat access denied");
  }

  const encrypted = encryptMessage(payload.content);
  await supabase.from("messages").insert({
    match_id: payload.matchId,
    sender_id: user.id,
    ciphertext: encrypted.ciphertext,
    iv: encrypted.iv,
    auth_tag: encrypted.authTag,
  });

  revalidatePath(`/chat/${payload.matchId}`);
}

function createRazorpay() {
  return new Razorpay({
    key_id: requireEnv("NEXT_PUBLIC_RAZORPAY_KEY_ID", process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID),
    key_secret: requireEnv("RAZORPAY_KEY_SECRET", process.env.RAZORPAY_KEY_SECRET),
  });
}

export async function createPaymentOrder(formData: FormData) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const payload = paymentIntentSchema.parse({
    plan: String(formData.get("plan") || ""),
    acceptNoRefunds: formData.get("acceptNoRefunds") === "on",
  }) as { plan: "monthly" | "yearly"; acceptNoRefunds: true };

  const amount = payload.plan === "monthly" ? appConfig.pricing.monthly : appConfig.pricing.yearly;
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + (payload.plan === "monthly" ? 1 : 12));

  const order = await createRazorpay().orders.create({
    amount: amount * 100,
    currency: "INR",
    receipt: `flirmo_${user.id}_${Date.now()}`,
    notes: {
      userId: user.id,
      plan: payload.plan,
    },
  });

  await createAdminClient().from("payments").insert({
    user_id: user.id,
    plan: payload.plan,
    amount,
    currency: "INR",
    status: "inactive",
    razorpay_order_id: order.id,
    period_start: new Date().toISOString(),
    period_end: periodEnd.toISOString(),
    no_refund_acknowledged: true,
  });

  return { orderId: order.id, amount, key: appConfig.razorpayKeyId, plan: payload.plan };
}

export async function verifyPayment({
  orderId,
  paymentId,
  signature,
}: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const expected = crypto
    .createHmac("sha256", requireEnv("RAZORPAY_KEY_SECRET", process.env.RAZORPAY_KEY_SECRET))
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  if (expected !== signature) {
    throw new Error("Payment verification failed");
  }

  const admin = createAdminClient();
  const { data: payment } = await admin
    .from("payments")
    .select("*")
    .eq("razorpay_order_id", orderId)
    .maybeSingle();

  if (!payment) {
    throw new Error("Payment record not found");
  }

  await admin
    .from("payments")
    .update({
      status: "active",
      razorpay_payment_id: paymentId,
    })
    .eq("id", payment.id);

  await admin
    .from("profiles")
    .update({
      subscription_plan: payment.plan,
      subscription_status: "active",
      subscription_ends_at: payment.period_end,
    })
    .eq("id", payment.user_id);

  revalidatePath("/pricing");
  revalidatePath("/settings");
}

export async function setSuspension(userId: string, suspended: boolean) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: adminProfile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!adminProfile?.is_admin) redirect("/discover");

  await createAdminClient()
    .from("profiles")
    .update({
      is_suspended: suspended,
      suspension_reason: suspended ? "Suspended by admin moderation review" : null,
    })
    .eq("id", userId);

  revalidatePath("/admin");
}

export async function resolveReport(reportId: string, status: "reviewing" | "resolved") {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: adminProfile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!adminProfile?.is_admin) redirect("/discover");

  await createAdminClient().from("reports").update({ status }).eq("id", reportId);
  revalidatePath("/admin");
}

export async function resolveContact(contactId: string, status: "reviewing" | "resolved") {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: adminProfile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!adminProfile?.is_admin) redirect("/discover");

  await createAdminClient().from("contact_submissions").update({ status }).eq("id", contactId);
  revalidatePath("/admin");
}

export async function adminDeleteUser(userId: string) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/signin");

  const { data: adminProfile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!adminProfile?.is_admin) redirect("/discover");

  await createAdminClient().auth.admin.deleteUser(userId);
  revalidatePath("/admin");
}
