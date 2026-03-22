import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Card } from "@/components/ui/card";

export function LegalPage({
  title,
  intro,
  sections,
}: {
  title: string;
  intro: string;
  sections: { heading: string; body: string[] }[];
}) {
  return (
    <div className="min-h-screen bg-sand">
      <SiteHeader />
      <main className="px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <Card className="bg-ink text-white">
            <h1 className="text-4xl font-semibold">{title}</h1>
            <p className="mt-4 text-sm leading-7 text-white/75">{intro}</p>
          </Card>
          {sections.map((section) => (
            <Card key={section.heading}>
              <h2 className="text-2xl font-semibold text-ink">{section.heading}</h2>
              <div className="mt-4 space-y-4 text-sm leading-7 text-slate-700">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
