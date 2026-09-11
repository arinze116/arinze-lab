import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/ui/project-card";
import { WritingCard } from "@/components/ui/writing-card";
import { ResearchCard } from "@/components/ui/research-card";
import {
  getAllResearch,
  getAllWriting,
  getFeaturedProjects,
} from "@/lib/content";
const focus = [
  "Software systems",
  "Security research",
  "Automation & AI",
  "Web3 tooling",
];
export default function HomePage() {
  const projects = getFeaturedProjects();
  const writing = getAllWriting().slice(0, 2);
  const research = getAllResearch().slice(0, 1);
  return (
    <>
      <section className="rule-grid border-b border-[var(--color-border)]">
        <div className="page-shell grid min-h-[580px] content-center gap-10 md:grid-cols-[1.5fr_.75fr] md:gap-20">
          <div>
            <p className="eyebrow">Arinze Chinweuba / Nigeria</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-bold leading-[.98] tracking-[-.055em] md:text-7xl">
              Software developer.
              <br />
              Security researcher.
              <br />
              <span className="text-[var(--color-text-secondary)]">
                Builder.
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-[var(--color-text-secondary)] md:text-lg">
              I design practical software, investigate security problems, and
              build automation that earns its place in the workflow.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button href="/projects">
                View work <ArrowUpRight size={15} />
              </Button>
              <Button href="/resume" variant="secondary">
                View resume
              </Button>
              <Button href="/contact" variant="text">
                Get in touch
              </Button>
            </div>
          </div>
          <aside className="border-l border-[var(--color-border)] pl-5 md:self-end">
            <p className="eyebrow">Current direction</p>
            <p className="mt-3 text-lg leading-7">
              Open to software engineering, security, automation, and Web3
              opportunities.
            </p>
            <div className="mt-8 space-y-3">
              {focus.map((item, index) => (
                <div
                  key={item}
                  className="flex items-center gap-3 border-t border-[var(--color-border)] pt-3 font-mono text-xs text-[var(--color-text-secondary)]"
                >
                  <span>0{index + 1}</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
      <section className="page-shell">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">Selected work</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Projects built around real constraints.
            </h2>
          </div>
          <Button
            href="/projects"
            variant="text"
            className="hidden md:inline-flex"
          >
            All work <ArrowUpRight size={15} />
          </Button>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
        <Button href="/projects" variant="secondary" className="mt-6 md:hidden">
          All work
        </Button>
      </section>
      <section className="border-y border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <div className="page-shell grid gap-10 md:grid-cols-[.7fr_1.3fr]">
          <div>
            <p className="eyebrow">Technical focus</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Useful systems over impressive-looking demos.
            </h2>
          </div>
          <div className="grid gap-px bg-[var(--color-border)] sm:grid-cols-2">
            {focus.map((item, index) => (
              <div key={item} className="bg-[var(--color-bg-secondary)] p-5">
                <p className="font-mono text-xs text-[var(--color-text-faint)]">
                  0{index + 1}
                </p>
                <p className="mt-8 text-lg font-semibold">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="page-shell grid gap-12 lg:grid-cols-2">
        <div>
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow">Engineering notes</p>
              <h2 className="mt-3 text-2xl font-bold">
                Writing from the work.
              </h2>
            </div>
            <Button href="/writing" variant="text">
              All <ArrowUpRight size={15} />
            </Button>
          </div>
          <div className="mt-7 grid gap-4">
            {writing.map((post) => (
              <WritingCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow">Research</p>
              <h2 className="mt-3 text-2xl font-bold">
                Questions worth testing.
              </h2>
            </div>
            <Button href="/research" variant="text">
              All <ArrowUpRight size={15} />
            </Button>
          </div>
          <div className="mt-7">
            {research.map((paper) => (
              <ResearchCard key={paper.slug} paper={paper} />
            ))}
          </div>
          <div className="mt-4 border border-[var(--color-border)] p-5">
            <p className="eyebrow">Working now</p>
            <p className="mt-3 leading-7 text-[var(--color-text-secondary)]">
              Expanding contract-risk tooling and continuing to make developer
              automation more reliable under constrained infrastructure.
            </p>
            <Button href="/now" variant="text" className="mt-5">
              What I’m doing now <ArrowUpRight size={15} />
            </Button>
          </div>
        </div>
      </section>
      <section className="page-shell pt-0">
        <div className="border border-[var(--color-border)] p-7 md:flex md:items-end md:justify-between md:p-10">
          <div>
            <p className="eyebrow">Opportunities</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Have a difficult problem to solve?
            </h2>
            <p className="mt-3 max-w-2xl text-[var(--color-text-secondary)]">
              I’m open to thoughtful conversations about engineering, security,
              AI automation, and Web3 work.
            </p>
          </div>
          <Button href="/contact" className="mt-6 md:mt-0">
            Start a conversation <ArrowUpRight size={15} />
          </Button>
        </div>
      </section>
    </>
  );
}
