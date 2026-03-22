import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckoutCard } from "@/components/payments/checkout-card";
import { appConfig } from "@/lib/config";
import { deleteOwnAccount, saveProfileDetails, toggleVisibility, uploadAvatar } from "@/lib/actions";
import { requireUser } from "@/lib/auth";
import { buildMetadata } from "@/lib/metadata";
import { cities, genderOptions, interestOptions } from "@/lib/constants";

export const metadata = buildMetadata({
  title: "Settings",
  description: "Manage your Flirmo profile, visibility, account deletion, and subscription controls.",
  path: "/settings",
});

export default async function SettingsPage() {
  const { profile } = await requireUser();

  return (
    <AppShell profile={profile!}>
      <div className="space-y-6">
        <Card>
          <h1 className="text-3xl font-semibold text-ink">Profile and account settings</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Update your data, hide your profile, review your plan, or permanently delete your account.
          </p>
        </Card>

        <Card>
          <h2 className="text-2xl font-semibold text-ink">Edit profile</h2>
          <form action={uploadAvatar} className="mt-6 flex flex-col gap-3 rounded-[1.5rem] bg-sand p-4 sm:flex-row sm:items-center">
            <Input name="avatar" type="file" accept="image/png,image/jpeg,image/webp" className="bg-white" />
            <Button type="submit" variant="secondary">Upload avatar</Button>
          </form>
          <form action={saveProfileDetails} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input name="fullName" defaultValue={profile?.full_name || ""} required />
              <Input name="age" type="number" min={18} max={99} defaultValue={profile?.age || 18} required />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <select name="gender" defaultValue={profile?.gender || "prefer-not-to-say"} className="w-full rounded-3xl border border-black/10 bg-white px-4 py-3 text-sm">
                {genderOptions.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
              <select name="city" defaultValue={profile?.city || cities[0]} className="w-full rounded-3xl border border-black/10 bg-white px-4 py-3 text-sm">
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
            <Textarea name="bio" defaultValue={profile?.bio || ""} />
            <div className="flex flex-wrap gap-3">
              {interestOptions.map((interest) => (
                <label key={interest} className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    name="interests"
                    value={interest}
                    defaultChecked={(profile?.interests || []).includes(interest)}
                    className="mr-2"
                  />
                  {interest}
                </label>
              ))}
            </div>
            <Button type="submit">Save changes</Button>
          </form>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <h2 className="text-2xl font-semibold text-ink">Visibility</h2>
            <p className="mt-3 text-sm text-slate-600">
              Hidden profiles stay out of discovery, but your account remains active.
            </p>
            <form action={async () => { "use server"; await toggleVisibility(!profile?.is_hidden); }} className="mt-6">
              <Button type="submit" variant="secondary">
                {profile?.is_hidden ? "Show my profile" : "Hide my profile"}
              </Button>
            </form>
          </Card>

          <Card>
            <h2 className="text-2xl font-semibold text-ink">Billing and memberships</h2>
            <p className="mt-3 text-sm text-slate-600">
              Current plan: {profile?.subscription_plan}. No refunds are provided under any circumstances.
            </p>
            <div className="mt-6 space-y-4">
              <CheckoutCard
                plan="monthly"
                buttonLabel={`Upgrade monthly - Rs ${appConfig.pricing.monthly}`}
              />
              <CheckoutCard
                plan="yearly"
                buttonLabel={`Upgrade yearly - Rs ${appConfig.pricing.yearly}`}
              />
            </div>
          </Card>
        </div>

        <Card className="border border-red-100">
          <h2 className="text-2xl font-semibold text-ink">Delete account</h2>
          <p className="mt-3 text-sm text-slate-600">
            This permanently removes your access. Some records may be retained when required for legal, fraud, billing, or abuse-prevention purposes.
          </p>
          <form action={deleteOwnAccount} className="mt-6">
            <Button type="submit" variant="danger">Delete my account</Button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
