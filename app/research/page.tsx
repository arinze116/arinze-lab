import { getAllResearch } from "@/lib/content";
import { ResearchCard } from "@/components/ui/research-card";

export const metadata = {
  title: "Research",
  description: "Deeper technical explorations, experiments, and long-form analysis.",
};

export default function ResearchPage() {
  const papers = getAllResearch();
  return (
    <section className="mx-auto max-w-[1280px] px-5 py-16 md:px-8">
      <h1 className="text-3xl font-bold md:text-4xl">Research</h1>
      <p className="mt-3 max-w-xl text-[var(--color-text-secondary)]">
        Deeper technical explorations, experiments, documentation, and
        long-form analysis.
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
