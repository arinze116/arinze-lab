import type { Metadata } from "next";
import { getAllProjects } from "@/lib/content";
import { ProjectsExplorer } from "@/components/sections/projects-explorer";

export const metadata: Metadata = {
  title: "Projects",
  description: "A showcase of software Arinze has designed, built, and shipped.",
  alternates: { canonical: "/projects" },
  openGraph: {
    title: "Projects",
    description: "A showcase of software Arinze has designed, built, and shipped.",
    url: "/projects",
    type: "website",
  },
};

export default function ProjectsPage() {
  const projects = getAllProjects();
  return (
    <section className="mx-auto max-w-[1280px] px-5 py-16 md:px-8">
      <h1 className="text-3xl font-bold md:text-4xl">Projects</h1>
      <p className="mt-3 max-w-xl text-[var(--color-text-secondary)]">
        A showcase of software I&apos;ve designed, built, and shipped.
      </p>
      <div className="mt-10">
        <ProjectsExplorer projects={projects} />
      </div>
    </section>
  );
}
