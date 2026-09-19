import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/ui/project-card";
import { WritingCard } from "@/components/ui/writing-card";
import { ResearchCard } from "@/components/ui/research-card";
import {
  getAllResearch,
  getAllWriting,
  getAllProjects,
  getFeaturedProjects,
} from "@/lib/content";
import { getSiteContent } from "@/lib/site-content";

export default function HomePage() {
  const content = getSiteContent();
  const focus = content.homepage.focusAreas
    .filter((item) => item.visible)
    .sort((a, b) => a.order - b.order);
  const allProjects = getAllProjects();
  const selectedProjects = content.homepage.selectedProjects
    .filter((item) => item.visible)
    .sort((a, b) => a.order - b.order)
    .map((item) => allProjects.find((project) => project.slug === item.slug))
    .filter((project): project is NonNullable<typeof project> => Boolean(project));
  const projects = selectedProjects.length > 0 ? selectedProjects : getFeaturedProjects();
  const allWriting = getAllWriting();
  const selectedWriting = content.homepage.writing.selectedPosts
    .filter((item) => item.visible)
    .sort((a, b) => a.order - b.order)
    .map((item) => allWriting.find((post) => post.slug === item.slug))
    .filter((post): post is NonNullable<typeof post> => Boolean(post));
  const writing = (selectedWriting.length > 0 ? selectedWriting : allWriting).slice(0, 2);
  const allResearch = getAllResearch();
  const selectedResearch = content.homepage.research.selectedResearch
    .filter((item) => item.visible)
    .sort((a, b) => a.order - b.order)
    .map((item) => allResearch.find((paper) => paper.slug === item.slug))
    .filter((paper): paper is NonNullable<typeof paper> => Boolean(paper));
  const research = (selectedResearch.length > 0 ? selectedResearch : allResearch).slice(0, 1);
  const heroTitle = content.homepage.hero.title.split("\n");
  return (
    <>
      <section className="rule-grid border-b border-[var(--color-border)]">
        <div className="page-shell grid min-h-[580px] content-center gap-10 md:grid-cols-[1.5fr_.75fr] md:gap-20">
          <div>
            <p className="eyebrow">{content.homepage.hero.eyebrow}</p>
            <h1 className="mt-5 max-w-4xl text-5xl font-bold leading-[.98] tracking-[-.055em] md:text-7xl">
              {heroTitle.map((line, index) => (
                <span key={`${line}-${index}`} className={index === heroTitle.length - 1 ? "text-[var(--color-text-secondary)]" : ""}>
                  {line}
                  {index < heroTitle.length - 1 && <br />}
                </span>
              ))}
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-[var(--color-text-secondary)] md:text-lg">
              {content.homepage.hero.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {content.homepage.hero.buttons
                .filter((button) => button.visible)
                .sort((a, b) => a.order - b.order)
                .map((button) => (
                  <Button key={button.href} href={button.href} variant={button.variant}>
                    {button.label} {button.variant !== "secondary" && <ArrowUpRight size={15} />}
                  </Button>
                ))}
            </div>
          </div>
          {content.homepage.currentDirection.visible && <aside className="border-l border-[var(--color-border)] pl-5 md:self-end">
            <p className="eyebrow">{content.homepage.currentDirection.heading}</p>
            <p className="mt-3 text-lg leading-7">
              {content.homepage.currentDirection.body}
            </p>
            <div className="mt-8 space-y-3">
              {focus.map((item, index) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 border-t border-[var(--color-border)] pt-3 font-mono text-xs text-[var(--color-text-secondary)]"
                >
                  <span>0{index + 1}</span>
                   <span>{item.label}</span>
                </div>
              ))}
            </div>
          </aside>}
        </div>
      </section>
      {content.homepage.selectedWork.visible && <section className="page-shell">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow">{content.homepage.selectedWork.eyebrow}</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              {content.homepage.selectedWork.heading}
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
      </section>}
      {content.homepage.technicalFocus.visible && <section className="border-y border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        <div className="page-shell grid gap-10 md:grid-cols-[.7fr_1.3fr]">
          <div>
            <p className="eyebrow">{content.homepage.technicalFocus.eyebrow}</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              {content.homepage.technicalFocus.heading}
            </h2>
          </div>
          <div className="grid gap-px bg-[var(--color-border)] sm:grid-cols-2">
            {content.homepage.technicalFocus.items
              .filter((item) => item.visible)
              .sort((a, b) => a.order - b.order)
              .map((item, index) => (
               <div key={item.label} className="bg-[var(--color-bg-secondary)] p-5">
                <p className="font-mono text-xs text-[var(--color-text-faint)]">
                  0{index + 1}
                </p>
                <p className="mt-8 text-lg font-semibold">{item.label}</p>
              </div>
              ))}
          </div>
        </div>
      </section>}
      <section className="page-shell grid gap-12 lg:grid-cols-2">
        {content.homepage.writing.visible && <div>
          <div className="flex items-end justify-between">
            <div>
              <p className="eyebrow">{content.homepage.writing.eyebrow}</p>
              <h2 className="mt-3 text-2xl font-bold">
                {content.homepage.writing.heading}
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
        </div>}
        {content.homepage.research.visible && <div>
          <div className="flex items-end justify-between">
            <div>
            <p className="eyebrow">{content.homepage.research.eyebrow}</p>
            <h2 className="mt-3 text-2xl font-bold">
                {content.homepage.research.heading}
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
           {content.homepage.workingNow.visible && <div className="mt-4 border border-[var(--color-border)] p-5">
             <p className="eyebrow">{content.homepage.workingNow.eyebrow}</p>
             <p className="mt-3 leading-7 text-[var(--color-text-secondary)]">
               {content.homepage.workingNow.body}
             </p>
             <Button href={content.homepage.workingNow.linkUrl} variant="text" className="mt-5">
               {content.homepage.workingNow.linkLabel} <ArrowUpRight size={15} />
             </Button>
           </div>}
        </div>}
      </section>
       {content.homepage.opportunities.visible && <section className="page-shell pt-0">
        <div className="border border-[var(--color-border)] p-7 md:flex md:items-end md:justify-between md:p-10">
          <div>
            <p className="eyebrow">{content.homepage.opportunities.eyebrow}</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              {content.homepage.opportunities.heading}
            </h2>
            <p className="mt-3 max-w-2xl text-[var(--color-text-secondary)]">
              {content.homepage.opportunities.description}
            </p>
          </div>
          <Button href={content.homepage.opportunities.buttonUrl} className="mt-6 md:mt-0">
            {content.homepage.opportunities.buttonLabel} <ArrowUpRight size={15} />
          </Button>
        </div>
      </section>}
    </>
  );
}
