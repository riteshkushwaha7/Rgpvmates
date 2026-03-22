import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Card } from "@/components/ui/card";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Account suspended",
  description: "A suspended Flirmo account cannot access product features until the moderation issue is resolved.",
  path: "/suspended",
});

export default function SuspendedPage() {
  return (
    <div className="min-h-screen bg-sand">
      <SiteHeader />
      <main className="px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <Card className="bg-ink text-white">
            <h1 className="text-4xl font-semibold">This account has been suspended.</h1>
            <p className="mt-4 text-sm leading-7 text-white/75">
              Suspended users cannot access Flirmo features. If you believe this is an error, contact support using the contact page.
            </p>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
