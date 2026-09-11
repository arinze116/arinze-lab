import type { Metadata } from "next";
import { getAllProjects, getAllWriting, getAllResearch } from "@/lib/content";
import { SearchClient } from "@/components/sections/search-client";

export const metadata: Metadata = {
  title: "Search",
  description: "Search projects, writing, and research on Arinze Lab.",
  alternates: { canonical: "/search" },
  // Thin utility page with no unique crawlable content — keep it out of the index.
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  const projects = getAllProjects();
  const writing = getAllWriting();
  const research = getAllResearch();

  return (
    <section className="page-shell">
      <p className="eyebrow">Site index</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
        Search the lab.
      </h1>
      <p className="mt-3 text-[var(--color-text-secondary)]">
        Find projects, articles, and research.
      </p>
      <div className="mt-10">
        <SearchClient
          projects={projects}
          writing={writing}
          research={research}
        />
      </div>
    </section>
  );
}
