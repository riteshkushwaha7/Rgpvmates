import { LegalPage } from "@/components/legal/legal-page";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Refund Policy",
  description: "Understand Flirmo's no-refund policy for digital memberships.",
  path: "/refund-policy",
});

export default function RefundPolicyPage() {
  return (
    <LegalPage
      title="Refund Policy"
      intro="Flirmo membership purchases are governed by a strict no-refund rule that is shown before checkout and must be acknowledged before payment."
      sections={[
        {
          heading: "No refunds",
          body: [
            "No refunds will be provided under any circumstances.",
            "This policy applies to monthly plans, yearly plans, accidental purchases, dissatisfaction, reduced usage, account restrictions, suspension for rule violations, and all other scenarios unless a non-waivable legal requirement applies.",
          ],
        },
        {
          heading: "Checkout visibility",
          body: [
            "Before payment, users must see the pricing, the no-refund warning, and a required acknowledgement checkbox confirming that they understand the policy.",
            "Payment success on the client is not treated as final until server-side verification is complete.",
          ],
        },
      ]}
    />
  );
}
