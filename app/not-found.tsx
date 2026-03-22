import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-sand px-6">
      <div className="max-w-lg rounded-[2rem] bg-white p-8 text-center shadow-soft">
        <h1 className="text-3xl font-semibold text-ink">This route doesn’t exist.</h1>
        <p className="mt-3 text-sm leading-7 text-slate-600">The page may have moved while Flirmo was modernized.</p>
        <Link href="/" className="mt-6 inline-flex rounded-full bg-brand-600 px-5 py-3 text-sm font-semibold text-white">
          Back to home
        </Link>
      </div>
    </main>
  );
}
