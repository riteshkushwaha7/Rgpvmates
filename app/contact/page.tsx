import { buildMetadata } from "@/lib/metadata";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { submitContact } from "@/lib/actions";

export const metadata = buildMetadata({
  title: "Contact Us",
  description: "Contact Flirmo for support, policy, safety, billing, or moderation questions.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-sand">
      <SiteHeader />
      <main className="px-4 py-10 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <Card className="bg-ink text-white">
            <h1 className="text-4xl font-semibold">Contact Flirmo</h1>
            <p className="mt-4 text-sm leading-7 text-white/75">
              Reach us for support, moderation concerns, safety issues, billing questions, or legal requests.
            </p>
          </Card>
          <Card>
            <form action={submitContact} className="space-y-4">
              <Input name="name" placeholder="Your name" required />
              <Input name="email" type="email" placeholder="you@example.com" required />
              <Input name="subject" placeholder="Subject" required />
              <Textarea name="message" placeholder="How can we help?" required />
              <Button type="submit" className="w-full justify-center">Send message</Button>
            </form>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
