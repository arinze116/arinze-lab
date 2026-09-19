import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getFeaturedProjects } from "@/lib/content";
import { siteConfig } from "@/lib/site";
import { getSiteContent } from "@/lib/site-content";

const siteContent = getSiteContent();
export const metadata: Metadata = {
  title: siteContent.resume.title,
  description: siteContent.resume.summary,
  alternates: { canonical: "/resume" },
};
export default function ResumePage() {
  const projects = getFeaturedProjects();
  return (
    <article className="mx-auto max-w-[900px] px-5 py-16 md:px-8">
      <div className="flex flex-wrap items-start justify-between gap-6 border-b border-[var(--color-border)] pb-8">
        <div>
          <p className="eyebrow">{siteContent.resume.eyebrow}</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            {siteContent.resume.title}
          </h1>
          <p className="mt-2 text-lg text-[var(--color-text-secondary)]">
            {siteContent.resume.role}
          </p>
        </div>
        <div className="text-sm leading-7 text-[var(--color-text-secondary)]">
          <a
            className="block hover:text-white"
            href={`mailto:${siteConfig.email}`}
          >
            {siteConfig.email}
          </a>
          <a
            className="block hover:text-white"
            href={siteConfig.socials.github}
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <a
            className="block hover:text-white"
            href={siteConfig.socials.linkedin}
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
        </div>
      </div>
      <section className="mt-10">
        <h2 className="eyebrow">{siteContent.resume.summaryLabel}</h2>
        <p className="mt-3 max-w-3xl leading-7 text-[var(--color-text-secondary)]">
          {siteContent.resume.summary}
        </p>
      </section>
      <section className="mt-10">
        <h2 className="eyebrow">{siteContent.resume.skillsLabel}</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {siteContent.resume.skills.map((skill) => (
            <span
              key={skill}
              className="border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-text-secondary)]"
            >
              {skill}
            </span>
          ))}
        </div>
      </section>
      <section className="mt-10">
        <h2 className="eyebrow">{siteContent.resume.projectsLabel}</h2>
        <div className="mt-4 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
          {projects.map((project) => (
            <div key={project.slug} className="py-5">
              <div className="flex flex-wrap justify-between gap-2">
                <h3 className="font-semibold">{project.title}</h3>
                <span className="font-mono text-xs text-[var(--color-text-faint)]">
                  {project.year} · {project.status}
                </span>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--color-text-secondary)]">
                {project.summary}
              </p>
              <Link
                href={`/projects/${project.slug}`}
                className="mt-3 inline-flex items-center gap-1 text-sm hover:underline"
              >
                Case study <ArrowUpRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </section>
      <section className="mt-10">
        <h2 className="eyebrow">{siteContent.resume.researchWritingLabel}</h2>
        <p className="mt-3 max-w-3xl leading-7 text-[var(--color-text-secondary)]">
          {siteContent.resume.researchWritingDescription}
        </p>
        <div className="mt-4 flex gap-5 text-sm">
          <Link href="/writing" className="hover:underline">
            Read writing
          </Link>
          <Link href="/research" className="hover:underline">
            Read research
          </Link>
        </div>
      </section>
    </article>
  );
}
