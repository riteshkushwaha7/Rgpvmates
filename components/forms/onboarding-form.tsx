import { completeOnboarding } from "@/lib/actions";
import { cities, genderOptions, interestOptions } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function OnboardingForm() {
  return (
    <form action={completeOnboarding} className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Full name</label>
          <Input name="fullName" required maxLength={80} />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Age</label>
          <Input name="age" type="number" min={18} max={99} required />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">Gender</label>
          <select
            name="gender"
            className="w-full rounded-3xl border border-black/10 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            required
          >
            {genderOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700">City</label>
          <select
            name="city"
            className="w-full rounded-3xl border border-black/10 bg-white px-4 py-3 text-sm text-ink outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            required
          >
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">Bio</label>
        <Textarea name="bio" maxLength={280} placeholder="Write a short intro that feels like you." />
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-slate-700">Choose 2 to 6 interests</p>
        <div className="flex flex-wrap gap-3">
          {interestOptions.map((interest) => (
            <label key={interest} className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-slate-700">
              <input type="checkbox" name="interests" value={interest} className="mr-2" />
              {interest}
            </label>
          ))}
        </div>
      </div>

      <Card className="bg-brand-50">
        <label className="flex items-start gap-3 text-sm leading-7 text-slate-700">
          <input type="checkbox" name="isAdultConfirmed" required className="mt-1" />
          <span>
            I confirm that I am 18+ and understand that Flirmo is for adults only. Underage users are not permitted.
          </span>
        </label>
      </Card>

      <Card className="bg-white">
        <p className="text-sm leading-7 text-slate-700">
          By continuing, you agree to the Terms & Conditions, Privacy Policy, Safety Guidelines, and Refund Policy.
        </p>
      </Card>

      <Button type="submit" size="lg" className="w-full justify-center">
        Complete profile
      </Button>
    </form>
  );
}
