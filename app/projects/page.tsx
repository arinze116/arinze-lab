import type { Metadata } from "next";
import { getAllProjects } from "@/lib/content";
import { ProjectsExplorer } from "@/components/sections/projects-explorer";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "A showcase of software Arinze has designed, built, and shipped.",
  alternates: { canonical: "/projects" },
  openGraph: {
    title: "Projects",
    description:
      "A showcase of software Arinze has designed, built, and shipped.",
    url: "/projects",
    type: "website",
  },
};

export default function ProjectsPage() {
  const projects = getAllProjects();
  return (
    <section className="page-shell">
      <p className="eyebrow">Selected systems & experiments</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
        Work that holds up under use.
      </h1>
      <p className="mt-4 max-w-2xl leading-7 text-[var(--color-text-secondary)]">
        Software, automation, and security tooling built from the problem
        outward.
      </p>
      <div className="mt-10">
        <ProjectsExplorer projects={projects} />
      </div>
    </section>
  );
}
