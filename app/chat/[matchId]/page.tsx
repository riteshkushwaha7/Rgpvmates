import { format } from "date-fns";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RealtimeChat } from "@/components/chat/realtime-chat";
import { requireUser } from "@/lib/auth";
import { getMatches, getMatchMessages } from "@/lib/data";
import { sendMessage } from "@/lib/actions";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Chat",
  description: "Chat securely with matched users on Flirmo.",
  path: "/chat",
});

export default async function ChatPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = await params;
  const { user, profile } = await requireUser();
  const [matches, messages] = await Promise.all([getMatches(user.id), getMatchMessages(matchId)]);
  const activeMatch = matches.find((item) => item.id === matchId);

  return (
    <AppShell profile={profile!}>
      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <Card className="p-3">
          <div className="space-y-2">
            {matches.map((match) => (
              <a key={match.id} href={`/chat/${match.id}`} className="block rounded-[1.5rem] px-4 py-4 text-sm font-medium text-slate-600 transition hover:bg-sand hover:text-ink">
                {match.other_profile?.full_name}
              </a>
            ))}
          </div>
        </Card>
        <Card className="flex min-h-[72vh] flex-col p-0">
          <RealtimeChat matchId={matchId} />
          <div className="border-b border-black/5 px-6 py-5">
            <h1 className="text-2xl font-semibold text-ink">{activeMatch?.other_profile?.full_name || "Chat"}</h1>
            <p className="mt-1 text-sm text-slate-500">Only matched users can access this chat. Messages are stored encrypted at rest.</p>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto px-6 py-6">
            {messages.map((message) => (
              <div key={message.id} className={message.sender_id === user.id ? "ml-auto max-w-[82%]" : "max-w-[82%]"}>
                <div className={message.sender_id === user.id ? "rounded-[1.5rem] bg-brand-600 px-4 py-3 text-sm text-white" : "rounded-[1.5rem] bg-sand px-4 py-3 text-sm text-ink"}>
                  {message.content}
                </div>
                <div className="mt-1 text-xs text-slate-400">{format(new Date(message.created_at), "dd MMM, h:mm a")}</div>
              </div>
            ))}
            {!messages.length ? <p className="text-sm text-slate-500">No messages yet. Say hello respectfully.</p> : null}
          </div>
          <form action={sendMessage} className="border-t border-black/5 p-4">
            <input type="hidden" name="matchId" value={matchId} />
            <div className="flex gap-3">
              <Input name="content" placeholder="Write a message..." maxLength={1000} />
              <Button type="submit">Send</Button>
            </div>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
