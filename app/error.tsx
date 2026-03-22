"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-sand px-6">
      <div className="max-w-md rounded-[2rem] bg-white p-8 text-center shadow-soft">
        <h1 className="text-2xl font-semibold text-ink">We hit a problem loading this page.</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">Please retry. Sensitive technical details are hidden for safety.</p>
        <Button className="mt-6" onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
