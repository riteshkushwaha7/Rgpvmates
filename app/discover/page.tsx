import { AppShell } from "@/components/layout/app-shell";
import { DiscoverList } from "@/components/discover/discover-list";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { getDiscoverProfiles } from "@/lib/data";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Discover",
  description: "Browse profiles, like, pass, report, or block with adult-only safety controls on Flirmo.",
  path: "/discover",
});

export default async function DiscoverPage() {
  const { user, profile } = await requireUser();
  const profiles = await getDiscoverProfiles(user.id);

  return (
    <AppShell profile={profile!}>
      <div className="space-y-6">
        <Card>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Discover</p>
          <h1 className="mt-3 text-4xl font-semibold text-ink">Meet adults across India with safer defaults.</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Every card gives you direct report and block controls, and hidden or suspended profiles stay out of the feed.
          </p>
        </Card>
        <DiscoverList profiles={profiles} />
      </div>
    </AppShell>
  );
}
