import Link from "next/link";
import { Heart, MessageCircle, Settings, ShieldAlert, User2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { ProfileRecord } from "@/types/app";

const nav = [
  { href: "/discover", label: "Discover", icon: Heart },
  { href: "/matches", label: "Matches", icon: MessageCircle },
  { href: "/pricing", label: "Plans", icon: ShieldAlert },
  { href: "/profile", label: "Profile", icon: User2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export async function AppShell({
  profile,
  children,
}: {
  profile: ProfileRecord;
  children: React.ReactNode;
}) {
  async function signOut() {
    "use server";
    const { createServerSupabase } = await import("@/lib/supabase/server");
    const server = await createServerSupabase();
    await server.auth.signOut();
  }

  return (
    <div className="min-h-screen bg-sand bg-hero-glow">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 pb-28 pt-6 sm:px-6 lg:pb-8">
        <aside className="sticky top-6 hidden h-[calc(100vh-3rem)] w-72 flex-col rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-soft lg:flex">
          <div className="rounded-[1.75rem] bg-sand p-4">
            <div className="flex items-center gap-3">
              <Avatar name={profile.full_name} image={profile.avatar_url} className="h-14 w-14" />
              <div>
                <div className="font-semibold text-ink">{profile.full_name || "Flirmo member"}</div>
                <div className="text-sm text-slate-500">{profile.city || "Location hidden"}</div>
              </div>
            </div>
          </div>
          <nav className="mt-6 space-y-2">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-sand hover:text-ink">
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
            {profile.is_admin ? (
              <Link href="/admin" className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-sand hover:text-ink">
                <ShieldAlert className="h-4 w-4" />
                Admin
              </Link>
            ) : null}
          </nav>
          <form action={signOut} className="mt-auto">
            <Button type="submit" variant="secondary" className="w-full justify-center">
              Sign out
            </Button>
          </form>
        </aside>
        <main className="w-full">{children}</main>
      </div>
      <nav className="fixed inset-x-4 bottom-4 z-40 flex items-center justify-around rounded-[1.75rem] border border-white/70 bg-white/95 p-2 shadow-soft backdrop-blur lg:hidden">
        {nav.map((item) => (
          <Link key={item.href} href={item.href} className="flex min-w-[64px] flex-col items-center rounded-2xl px-3 py-2 text-[11px] font-medium text-slate-500">
            <item.icon className="mb-1 h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
