"use client";

import Script from "next/script";
import { useState } from "react";
import { appConfig } from "@/lib/config";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export function CheckoutCard({
  plan,
  buttonLabel,
}: {
  plan: "monthly" | "yearly";
  buttonLabel: string;
}) {
  const [loading, setLoading] = useState(false);
  const [accept, setAccept] = useState(false);

  async function handleCheckout() {
    if (!accept) return;
    setLoading(true);
    try {
      const response = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan, acceptNoRefunds: accept }),
      });

      if (!response.ok) {
        throw new Error("Unable to start payment");
      }

      const order = (await response.json()) as { orderId: string; amount: number; plan: string };
      if (!window.Razorpay) {
        throw new Error("Razorpay checkout unavailable");
      }

      const razorpay = new window.Razorpay({
        key: appConfig.razorpayKeyId,
        amount: order.amount * 100,
        currency: "INR",
        name: "Flirmo",
        description: `${order.plan} membership`,
        order_id: order.orderId,
        handler: async (response: Record<string, string>) => {
          const verifyResponse = await fetch("/api/payments/verify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            }),
          });
          if (!verifyResponse.ok) {
            throw new Error("Payment verification failed");
          }
          window.location.href = "/settings?payment=success";
        },
      });

      razorpay.open();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <label className="flex items-start gap-3 rounded-[1.5rem] bg-brand-50 p-4 text-sm leading-7 text-slate-700">
        <input type="checkbox" checked={accept} onChange={(event) => setAccept(event.target.checked)} className="mt-1" />
        <span>I acknowledge the No Refund Policy and understand that no refunds will be provided under any circumstances.</span>
      </label>
      <button
        type="button"
        onClick={() => void handleCheckout()}
        disabled={!accept || loading}
        className="inline-flex w-full items-center justify-center rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        {loading ? "Preparing checkout..." : buttonLabel}
      </button>
    </>
  );
}
