import { LegalPage } from "@/components/legal/legal-page";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Safety Guidelines",
  description: "Learn Flirmo safety rules, moderation controls, and reporting protections.",
  path: "/safety",
});

export default function SafetyPage() {
  return (
    <LegalPage
      title="Safety Guidelines"
      intro="Flirmo is designed with adult-only access, moderation controls, report tools, block tools, and account visibility controls to reduce misuse."
      sections={[
        {
          heading: "Safety expectations",
          body: [
            "Meet new people carefully. Avoid sharing private financial information, home addresses, OTPs, or sensitive identity documents through chat.",
            "If something feels unsafe, stop the interaction and use the report or block controls immediately.",
          ],
        },
        {
          heading: "Platform controls",
          body: [
            "Users can report profiles, block profiles, hide their own profile, update their data, and delete their account.",
            "Admins can review suspicious users, reports, contact submissions, payment issues, and account history needed for moderation.",
          ],
        },
        {
          heading: "Chat and privacy",
          body: [
            "Only matched users can access chats. Message access is restricted by database policies and server-side checks.",
            "Flirmo structures messaging so stronger encryption upgrades can be introduced without changing the user-facing chat flow.",
          ],
        },
      ]}
    />
  );
}
