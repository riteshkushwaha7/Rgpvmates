import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireEnv } from "@/lib/config";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const expected = crypto
      .createHmac("sha256", requireEnv("RAZORPAY_KEY_SECRET", process.env.RAZORPAY_KEY_SECRET))
      .update(`${body.orderId}|${body.paymentId}`)
      .digest("hex");

    if (expected !== body.signature) {
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { data: payment } = await admin.from("payments").select("*").eq("razorpay_order_id", body.orderId).maybeSingle();

    if (!payment) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
    }

    await admin
      .from("payments")
      .update({
        status: "active",
        razorpay_payment_id: body.paymentId,
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

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
  }
}
