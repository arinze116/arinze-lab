import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getFeaturedProjects } from "@/lib/content";
import { siteConfig } from "@/lib/site";
export const metadata: Metadata = {
  title: "Resume",
  description: "Professional profile and selected work by Arinze Chinweuba.",
  alternates: { canonical: "/resume" },
};
const skills = [
  "Python",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Next.js",
  "Telegram bot development",
  "Automation",
  "Smart-contract risk analysis",
  "Solana",
  "EVM",
  "Docker",
  "Linux / Termux",
];
export default function ResumePage() {
  const projects = getFeaturedProjects();
  return (
    <article className="mx-auto max-w-[900px] px-5 py-16 md:px-8">
      <div className="flex flex-wrap items-start justify-between gap-6 border-b border-[var(--color-border)] pb-8">
        <div>
          <p className="eyebrow">Professional profile</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            Arinze Chinweuba
          </h1>
          <p className="mt-2 text-lg text-[var(--color-text-secondary)]">
            Software developer · security researcher · builder
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
        <h2 className="eyebrow">Summary</h2>
        <p className="mt-3 max-w-3xl leading-7 text-[var(--color-text-secondary)]">
          Independent developer building software systems, developer automation,
          Telegram bots, and smart-contract risk tooling. Interested in
          practical backend and product engineering, with a focus on systems
          that remain useful under real operational constraints.
        </p>
      </section>
      <section className="mt-10">
        <h2 className="eyebrow">Technical focus</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {skills.map((skill) => (
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
        <h2 className="eyebrow">Selected projects</h2>
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
        <h2 className="eyebrow">Research & writing</h2>
        <p className="mt-3 max-w-3xl leading-7 text-[var(--color-text-secondary)]">
          Published technical notes and research cover practical bot
          infrastructure, Termux-based development, video-processing pipelines,
          and heuristic smart-contract risk scoring.
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
