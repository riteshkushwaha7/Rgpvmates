import { AppShell } from "@/components/layout/app-shell";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Profile",
  description: "Review your Flirmo profile, subscription, and visibility details.",
  path: "/profile",
});

export default async function ProfilePage() {
  const { profile } = await requireUser();

  return (
    <AppShell profile={profile!}>
      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <Card className="bg-ink text-white">
          <Avatar name={profile?.full_name} image={profile?.avatar_url} className="h-24 w-24" />
          <h1 className="mt-6 text-4xl font-semibold">{profile?.full_name}</h1>
          <p className="mt-2 text-white/75">{profile?.city || "City hidden"} {profile?.age ? `• ${profile.age}` : ""}</p>
          <p className="mt-6 text-sm leading-7 text-white/75">{profile?.bio || "Tell people more about you from settings."}</p>
        </Card>
        <div className="space-y-6">
          <Card>
            <h2 className="text-2xl font-semibold text-ink">Profile details</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {(profile?.interests || []).map((interest) => (
                <span key={interest} className="rounded-full bg-sand px-4 py-2 text-sm text-slate-700">{interest}</span>
              ))}
            </div>
          </Card>
          <Card>
            <h2 className="text-2xl font-semibold text-ink">Membership</h2>
            <p className="mt-3 text-sm text-slate-600">
              Current plan: <span className="font-semibold text-ink">{profile?.subscription_plan}</span> with status {profile?.subscription_status}.
            </p>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
