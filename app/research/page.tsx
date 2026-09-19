import type { Metadata } from "next";
import { getAllResearch } from "@/lib/content";
import { ResearchCard } from "@/components/ui/research-card";
import { getSiteContent } from "@/lib/site-content";

const siteContent = getSiteContent();

export const metadata: Metadata = {
  title: siteContent.pageSeo.research.title,
  description: siteContent.pageSeo.research.description,
  alternates: { canonical: siteContent.pageSeo.research.canonical },
  openGraph: {
    title: siteContent.pageSeo.research.title,
    description: siteContent.pageSeo.research.description,
    url: siteContent.pageSeo.research.canonical,
    type: "website",
  },
};

export default function ResearchPage() {
  const papers = getAllResearch();
  return (
    <section className="page-shell">
      <p className="eyebrow">Investigations & experiments</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
        Research with its assumptions visible.
      </h1>
      <p className="mt-4 max-w-2xl leading-7 text-[var(--color-text-secondary)]">
        Longer technical analysis, methodology, and findings from software and
        security work.
      </p>
      <div className="mt-10">
        {papers.length === 0 ? (
          <p className="py-16 text-center text-[var(--color-text-secondary)]">
            No research has been published yet. Check back soon.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-3">
            {papers.map((paper) => (
              <ResearchCard key={paper.slug} paper={paper} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
