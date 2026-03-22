import { redirect } from "next/navigation";
import { OnboardingForm } from "@/components/forms/onboarding-form";
import { Card } from "@/components/ui/card";
import { buildMetadata } from "@/lib/metadata";
import { requireUser } from "@/lib/auth";

export const metadata = buildMetadata({
  title: "Complete onboarding",
  description: "Finish your adult-only Flirmo profile with city, age, interests, and legal acknowledgement.",
  path: "/onboarding",
});

export default async function OnboardingPage() {
  const { profile } = await requireUser();
  if (profile?.onboarding_completed) {
    redirect("/discover");
  }

  return (
    <main className="min-h-screen bg-sand px-4 py-10 sm:px-6">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.92fr_1.08fr]">
        <Card className="bg-ink text-white">
          <h1 className="text-4xl font-semibold">Build your profile with adult-only checks built in.</h1>
          <p className="mt-4 text-sm leading-7 text-white/75">
            You must be 18+ to continue. Flirmo stores only the profile details needed for discovery, matching, billing, and moderation.
          </p>
        </Card>
        <Card>
          <OnboardingForm />
        </Card>
      </div>
    </main>
  );
}
