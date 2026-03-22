import Link from "next/link";
import { HeartHandshake, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-sand/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 shadow-float">
            <HeartHandshake className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-lg font-semibold text-ink">Flirmo</div>
            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Safer dating</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          <Link href="/pricing" className="text-sm text-slate-600 transition hover:text-ink">Pricing</Link>
          <Link href="/safety" className="text-sm text-slate-600 transition hover:text-ink">Safety</Link>
          <Link href="/contact" className="text-sm text-slate-600 transition hover:text-ink">Contact</Link>
          <Link href="/signin"><Button variant="secondary">Sign in</Button></Link>
        </nav>
        <div className="md:hidden">
          <ShieldCheck className="h-5 w-5 text-brand-600" />
        </div>
      </div>
    </header>
  );
}
