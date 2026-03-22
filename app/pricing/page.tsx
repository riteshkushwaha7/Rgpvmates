import Link from "next/link";
import { buildMetadata } from "@/lib/metadata";
import { appConfig } from "@/lib/config";
import { currency } from "@/lib/utils";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = buildMetadata({
  title: "Pricing",
  description: "Choose a monthly or yearly Flirmo membership and review the required no-refund notice before checkout.",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-sand">
      <SiteHeader />
      <main className="px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-6xl space-y-8">
          <Card className="bg-ink text-white">
            <h1 className="text-4xl font-semibold">Membership plans</h1>
            <p className="mt-4 text-sm leading-7 text-white/75">
              Before payment, Flirmo clearly displays pricing and the strict no-refund rule. Server-side verification is required after checkout.
            </p>
          </Card>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <h2 className="text-2xl font-semibold text-ink">Monthly</h2>
              <div className="mt-3 text-4xl font-semibold text-brand-700">{currency(appConfig.pricing.monthly)}</div>
              <p className="mt-3 text-sm text-slate-600">30 days of premium access.</p>
              <Link href="/signin" className="mt-6 inline-flex">
                <Button>Continue to checkout</Button>
              </Link>
            </Card>
            <Card>
              <h2 className="text-2xl font-semibold text-ink">Yearly</h2>
              <div className="mt-3 text-4xl font-semibold text-brand-700">{currency(appConfig.pricing.yearly)}</div>
              <p className="mt-3 text-sm text-slate-600">12 months of premium access.</p>
              <Link href="/signin" className="mt-6 inline-flex">
                <Button>Continue to checkout</Button>
              </Link>
            </Card>
          </div>
          <Card>
            <p className="text-sm font-semibold text-ink">Important:</p>
            <p className="mt-2 text-sm leading-7 text-slate-700">
              No refunds will be provided under any circumstances. This acknowledgement is required again during checkout.
            </p>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
