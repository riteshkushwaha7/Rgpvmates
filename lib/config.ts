export const appConfig = {
  name: "Flirmo",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
  pricing: {
    monthly: 49,
    yearly: 399,
  },
  supportEmail: "support@flirmo.com",
  legalVersionLabel: "Effective March 22, 2026",
};

export function requireEnv(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}
