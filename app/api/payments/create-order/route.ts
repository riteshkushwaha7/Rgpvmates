import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabase } from "@/lib/supabase/server";
import { appConfig, requireEnv } from "@/lib/config";
import { paymentIntentSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = paymentIntentSchema.parse(body);
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const amount = payload.plan === "monthly" ? appConfig.pricing.monthly : appConfig.pricing.yearly;
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + (payload.plan === "monthly" ? 1 : 12));

    const razorpay = new Razorpay({
      key_id: requireEnv("NEXT_PUBLIC_RAZORPAY_KEY_ID", process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID),
      key_secret: requireEnv("RAZORPAY_KEY_SECRET", process.env.RAZORPAY_KEY_SECRET),
    });

    const order = await razorpay.orders.create({
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

    return NextResponse.json({ orderId: order.id, amount, plan: payload.plan });
  } catch {
    return NextResponse.json({ error: "Unable to create payment order" }, { status: 400 });
  }
}
