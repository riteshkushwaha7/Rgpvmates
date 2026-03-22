import { LegalPage } from "@/components/legal/legal-page";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Terms & Conditions",
  description: "Read the platform rules, liability limits, and account enforcement rights for Flirmo.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms & Conditions"
      intro="These terms govern your use of Flirmo. By using the platform, you agree to these rules and acknowledge that dating interactions inherently involve personal risk."
      sections={[
        {
          heading: "Eligibility and age restriction",
          body: [
            "Flirmo is strictly for adults aged 18 and above. You must provide truthful age information and confirm you are 18+ before onboarding or purchase.",
            "If you are under 18, you must not create or use a Flirmo account.",
          ],
        },
        {
          heading: "Acceptable use",
          body: [
            "You must not harass, threaten, exploit, impersonate, stalk, scam, defraud, or upload illegal, abusive, hateful, violent, or sexually exploitative content.",
            "You must not attempt to bypass moderation, evade suspension, scrape data, reverse engineer private systems, or use Flirmo for unlawful activity.",
          ],
        },
        {
          heading: "Platform enforcement",
          body: [
            "Flirmo may suspend, restrict, hide, or permanently terminate accounts at our discretion where we detect safety risks, abuse, fraud, unlawful conduct, or policy violations.",
            "We may review reports, suspicious patterns, payment disputes, and moderation flags to protect users and the business.",
          ],
        },
        {
          heading: "Payments and risk",
          body: [
            "Membership plans are digital services. Access may be updated, limited, or withdrawn where required for security, legal, or operational reasons.",
            "Use of Flirmo is at your own risk. Flirmo does not guarantee any match outcome, relationship outcome, or user behavior.",
          ],
        },
        {
          heading: "Liability limitation",
          body: [
            "To the maximum extent permitted by law, Flirmo disclaims warranties and limits liability for losses arising from user conduct, service interruptions, account actions, or third-party integrations.",
          ],
        },
      ]}
    />
  );
}
