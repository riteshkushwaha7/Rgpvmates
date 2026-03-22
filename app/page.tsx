import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/metadata";
import { currency } from "@/lib/utils";
import { appConfig } from "@/lib/config";
import { legalBullets } from "@/lib/constants";

export const metadata = buildMetadata({
  title: "Safer dating for adults 18+",
  description:
    "Discover, match, and chat on a mobile-first dating platform designed for India with strong policies, admin moderation, and payment transparency.",
});

export default function HomePage() {
  return (
    <div className="min-h-screen bg-sand">
      <SiteHeader />
      <main>
        <section className="px-4 pb-16 pt-12 sm:px-6">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
            <div className="animate-rise">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white px-4 py-2 text-sm text-brand-700 shadow-soft">
                <Sparkles className="h-4 w-4" />
                18+ only, Google sign-in, transparent pricing
              </div>
              <h1 className="mt-6 max-w-3xl text-balance text-5xl font-semibold leading-tight text-ink sm:text-6xl">
                A production-ready dating platform should feel polished and safer from the first screen.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Flirmo is built for adults across India with profile controls, moderation workflows, transparent policies, secure payments, and realtime conversations backed by Supabase.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/signin">
                  <Button size="lg">
                    Continue with Google
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" variant="secondary">
                    View plans
                  </Button>
                </Link>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                {legalBullets.map((item) => (
                  <span key={item} className="rounded-full bg-white px-4 py-2 text-sm text-slate-600 shadow-soft">
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <Card className="overflow-hidden bg-gradient-to-br from-white via-white to-brand-50 p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="border-0 bg-ink p-6 text-white shadow-none">
                  <ShieldCheck className="h-7 w-7 text-teal" />
                  <h2 className="mt-10 text-2xl font-semibold">Privacy and moderation are product features.</h2>
                  <p className="mt-3 text-sm leading-7 text-white/75">
                    From legal pages to suspension rights and report workflows, Flirmo surfaces platform rules clearly before purchase and during onboarding.
                  </p>
                </Card>
                <div className="space-y-4">
                  <Card className="p-5">
                    <div className="text-sm text-slate-500">Monthly membership</div>
                    <div className="mt-2 text-3xl font-semibold text-ink">{currency(appConfig.pricing.monthly)}</div>
                    <p className="mt-2 text-sm text-slate-500">30 days of premium access</p>
                  </Card>
                  <Card className="p-5">
                    <div className="text-sm text-slate-500">Yearly membership</div>
                    <div className="mt-2 text-3xl font-semibold text-ink">{currency(appConfig.pricing.yearly)}</div>
                    <p className="mt-2 text-sm text-slate-500">Best long-term value</p>
                  </Card>
                  <Card className="p-5">
                    <div className="text-sm text-slate-500">Refund policy</div>
                    <div className="mt-2 text-xl font-semibold text-ink">No refunds under any circumstances</div>
                    <p className="mt-2 text-sm text-slate-500">Shown before checkout and acknowledged explicitly.</p>
                  </Card>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
