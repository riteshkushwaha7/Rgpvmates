import Link from "next/link";
import { MapPin } from "lucide-react";
import { blockUser, reportUser, swipeProfile } from "@/lib/actions";
import type { ProfileRecord } from "@/types/app";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function DiscoverList({ profiles }: { profiles: ProfileRecord[] }) {
  if (!profiles.length) {
    return (
      <Card>
        <h1 className="text-2xl font-semibold text-ink">No new profiles right now.</h1>
        <p className="mt-3 text-sm text-slate-600">Try again later or make your own profile more visible to keep your feed healthy.</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
      {profiles.map((profile) => (
        <Card key={profile.id} className="overflow-hidden p-0">
          <div className="relative aspect-[0.8] bg-gradient-to-br from-brand-100 via-white to-teal/40">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt={profile.full_name || "Profile"} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-end p-6">
                <div className="rounded-[1.5rem] bg-white/90 p-4 shadow-soft">
                  <div className="text-lg font-semibold text-ink">{profile.full_name}</div>
                </div>
              </div>
            )}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/85 to-transparent p-5 text-white">
              <h2 className="text-2xl font-semibold">
                {profile.full_name} {profile.age ? `, ${profile.age}` : ""}
              </h2>
              <p className="mt-2 inline-flex items-center gap-2 text-sm text-white/75">
                <MapPin className="h-4 w-4" />
                {profile.city || "City hidden"}
              </p>
              <p className="mt-3 text-sm leading-7 text-white/75">{profile.bio || "New on Flirmo."}</p>
            </div>
          </div>
          <div className="space-y-4 p-5">
            <div className="flex flex-wrap gap-2">
              {(profile.interests || []).map((interest) => (
                <span key={interest} className="rounded-full bg-sand px-3 py-2 text-xs text-slate-600">
                  {interest}
                </span>
              ))}
            </div>
            <div className="flex gap-3">
              <form action={async () => { "use server"; await swipeProfile(profile.id, "pass"); }} className="flex-1">
                <Button type="submit" variant="secondary" className="w-full justify-center">Pass</Button>
              </form>
              <form action={async () => { "use server"; await swipeProfile(profile.id, "like"); }} className="flex-1">
                <Button type="submit" className="w-full justify-center">Like</Button>
              </form>
            </div>
            <div className="flex gap-3 text-sm">
              <form action={async () => { "use server"; await blockUser(profile.id); }}>
                <button type="submit" className="text-slate-500 transition hover:text-ink">Block</button>
              </form>
              <details>
                <summary className="cursor-pointer text-slate-500 transition hover:text-ink">Report</summary>
                <form action={reportUser} className="mt-3 space-y-2">
                  <input type="hidden" name="reportedUserId" value={profile.id} />
                  <input name="category" className="w-full rounded-2xl border border-black/10 px-3 py-2 text-sm" placeholder="Reason" required />
                  <textarea name="details" className="w-full rounded-2xl border border-black/10 px-3 py-2 text-sm" placeholder="Details" />
                  <Button type="submit" variant="secondary">Send report</Button>
                </form>
              </details>
              <Link href="/safety" className="text-slate-500 transition hover:text-ink">Safety tips</Link>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
