import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { getMatches } from "@/lib/data";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Matches",
  description: "See your mutual matches and continue conversations on Flirmo.",
  path: "/matches",
});

export default async function MatchesPage() {
  const { user, profile } = await requireUser();
  const matches = await getMatches(user.id);

  return (
    <AppShell profile={profile!}>
      <div className="space-y-6">
        <Card>
          <h1 className="text-4xl font-semibold text-ink">Mutual matches</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">Only mutual likes can open chats, which keeps conversation access restricted.</p>
        </Card>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {matches.map((match) => (
            <Link key={match.id} href={`/chat/${match.id}`}>
              <Card className="h-full transition hover:-translate-y-1">
                <div className="flex items-center gap-4">
                  <Avatar name={match.other_profile?.full_name} image={match.other_profile?.avatar_url} className="h-16 w-16" />
                  <div>
                    <div className="text-xl font-semibold text-ink">{match.other_profile?.full_name}</div>
                    <div className="text-sm text-slate-500">{match.other_profile?.city || "City hidden"}</div>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600">{match.other_profile?.bio || "Start the conversation with something kind and specific."}</p>
              </Card>
            </Link>
          ))}
          {!matches.length ? (
            <Card>
              <h2 className="text-2xl font-semibold text-ink">No matches yet</h2>
              <p className="mt-3 text-sm text-slate-600">Keep discovering thoughtfully. Mutual likes will appear here.</p>
            </Card>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
