import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Sign in",
  description: "Continue to Flirmo with Google sign-in and review the legal policies before starting.",
  path: "/signin",
});

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-sand bg-hero-glow px-4 py-10 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <Card className="bg-ink text-white">
          <h1 className="text-4xl font-semibold">Google login only. Adults 18+ only.</h1>
          <p className="mt-4 text-sm leading-7 text-white/75">
            By continuing, you agree to the Terms & Conditions, Privacy Policy, Safety Guidelines, and Refund Policy.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/terms" className="rounded-full bg-white/10 px-4 py-2 text-sm">Terms</Link>
            <Link href="/privacy" className="rounded-full bg-white/10 px-4 py-2 text-sm">Privacy</Link>
            <Link href="/refund-policy" className="rounded-full bg-white/10 px-4 py-2 text-sm">Refund Policy</Link>
            <Link href="/safety" className="rounded-full bg-white/10 px-4 py-2 text-sm">Safety</Link>
          </div>
        </Card>
        <Card className="p-8 sm:p-10">
          <h2 className="text-3xl font-semibold text-ink">Continue to Flirmo</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            You will confirm 18+ eligibility during onboarding. Underage users are not allowed.
          </p>
          <div className="mt-8">
            <Link href="/api/auth/login">
              <Button size="lg" className="w-full justify-center">Continue with Google</Button>
            </Link>
          </div>
        </Card>
      </div>
    </main>
  );
}
