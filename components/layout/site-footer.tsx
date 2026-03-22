import Link from "next/link";
import { footerLinks } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t border-black/5 bg-white/70">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6">
        <p className="max-w-3xl text-sm leading-7 text-slate-500">
          Flirmo is for adults 18+ only. Use of the platform is at your own risk. We use Supabase, Google Auth, and Razorpay to operate core product functionality.
        </p>
        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="transition hover:text-ink">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
