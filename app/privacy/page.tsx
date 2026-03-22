import { LegalPage } from "@/components/legal/legal-page";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description: "Read how Flirmo collects, uses, stores, and protects personal data.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      intro="Flirmo handles sensitive profile, identity, and messaging data. This policy explains how we collect, use, store, and protect that information."
      sections={[
        {
          heading: "Data we collect",
          body: [
            "We collect data you provide directly, including your Google account identity, age, city, interests, profile photos, profile text, contact submissions, reports, and payment-related metadata.",
            "We also collect operational data such as sign-in events, moderation actions, and payment verification records needed to protect the platform and comply with legal obligations.",
          ],
        },
        {
          heading: "How we use data",
          body: [
            "We use your data to authenticate your account, create your profile, support matching and chat, process memberships, moderate abuse, and respond to support or legal requests.",
            "We may use automated or manual review to detect harassment, fraud, spam, suspicious activity, policy violations, or payment abuse.",
          ],
        },
        {
          heading: "Storage and third parties",
          body: [
            "Flirmo uses Supabase for database, auth, storage, and realtime infrastructure, Google for Google sign-in, and Razorpay for payment processing.",
            "Your data may be stored or processed through these providers according to their infrastructure and legal obligations. We do not sell your personal data.",
          ],
        },
        {
          heading: "Your controls and rights",
          body: [
            "You may update your profile, hide your profile, or request account deletion from your account controls.",
            "We may retain limited records when legally required, needed for payment reconciliation, fraud prevention, abuse investigation, or defense of legal claims.",
          ],
        },
        {
          heading: "Risk and liability",
          body: [
            "No online platform can guarantee perfect security or user behavior. Use Flirmo at your own risk and share personal information carefully.",
            "To the maximum extent permitted by law, Flirmo limits liability for indirect, incidental, special, or consequential damages arising from use of the platform.",
          ],
        },
      ]}
    />
  );
}
