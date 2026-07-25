import { getAllProjects, getAllWriting, getAllResearch } from "@/lib/content";
import { SearchClient } from "@/components/sections/search-client";

export const metadata = {
  title: "Search",
  description: "Search projects, writing, and research on Arinze Lab.",
};

export default function SearchPage() {
  const projects = getAllProjects();
  const writing = getAllWriting();
  const research = getAllResearch();

  return (
    <section className="mx-auto max-w-[1280px] px-5 py-16 md:px-8">
      <h1 className="text-3xl font-bold md:text-4xl">Search</h1>
      <p className="mt-3 text-[var(--color-text-secondary)]">
        Find projects, articles, and research.
      </p>
      <div className="mt-10">
        <SearchClient projects={projects} writing={writing} research={research} />
      </div>
    </section>
  );
}
