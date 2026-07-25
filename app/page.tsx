import Image from "next/image";
import { Github, Linkedin, Twitter, Mail, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "@/components/ui/project-card";
import { WritingCard } from "@/components/ui/writing-card";
import { ResearchCard } from "@/components/ui/research-card";
import { Badge } from "@/components/ui/badge";
import { getFeaturedProjects, getAllWriting, getAllResearch } from "@/lib/content";
import { siteConfig } from "@/lib/site";

const skillGroups = [
  { category: "Languages", items: ["Python", "TypeScript", "JavaScript", "Solidity"] },
  { category: "Frameworks", items: ["Next.js", "Node.js", "Express", "Telegraf"] },
  { category: "Databases", items: ["PostgreSQL", "Firebase", "Supabase"] },
  { category: "Tools", items: ["Git", "Docker", "VS Code", "Linux", "Termux"] },
];

export default function HomePage() {
  const projects = getFeaturedProjects();
  const writing = getAllWriting().slice(0, 3);
  const research = getAllResearch().slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section className="mx-auto max-w-[1280px] px-5 py-20 md:px-8 md:py-32">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              Building thoughtful software and sharing the journey behind it.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-[var(--color-text-secondary)]">
              I&apos;m Arinze, a software developer and researcher. Arinze Lab is
              where I showcase my work, document ideas, and share what I learn
              through building.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href="/projects" variant="primary">
                View Projects
              </Button>
              <Button href="/contact" variant="secondary">
                Contact Me
              </Button>
            </div>
            <div className="mt-10 flex items-center gap-5">
              <a href={siteConfig.socials.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="text-[var(--color-text-secondary)] hover:text-white transition-colors">
                <Github size={20} />
              </a>
              <a href={siteConfig.socials.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="text-[var(--color-text-secondary)] hover:text-white transition-colors">
                <Linkedin size={20} />
              </a>
              <a href={siteConfig.socials.x} target="_blank" rel="noreferrer" aria-label="X" className="text-[var(--color-text-secondary)] hover:text-white transition-colors">
                <Twitter size={20} />
              </a>
              <a href={`mailto:${siteConfig.email}`} aria-label="Email" className="text-[var(--color-text-secondary)] hover:text-white transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>
          <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]">
            <Image
              src="/images/portrait.svg"
              alt="Portrait of Arinze"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="mx-auto max-w-[1280px] px-5 py-16 md:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold md:text-3xl">Featured Projects</h2>
            <p className="mt-2 text-[var(--color-text-secondary)]">
              A selection of things I&apos;ve built recently.
            </p>
          </div>
          <Button href="/projects" variant="text" className="hidden md:inline-flex">
            View All Projects <ArrowUpRight size={14} />
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} />
          ))}
        </div>
        <div className="mt-8 md:hidden">
          <Button href="/projects" variant="secondary">
            View All Projects
          </Button>
        </div>
      </section>

      {/* About Preview */}
      <section className="mx-auto max-w-[1280px] px-5 py-16 md:px-8">
        <div className="grid items-center gap-12 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-8 md:grid-cols-[240px_1fr] md:p-12">
          <div className="relative mx-auto aspect-square w-40 overflow-hidden rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] md:w-full">
            <Image src="/images/portrait-square.svg" alt="Arinze" fill className="object-cover" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">About</h2>
            <p className="mt-4 max-w-2xl text-[var(--color-text-secondary)]">
              I&apos;m a developer based in Enugu, working across
              full-stack web development, Web3 infrastructure, Telegram bots,
              and security. Over the past few years I&apos;ve shipped
              products end-to-end, from idea through deployment, often
              hosting and testing them from a single phone running Termux.
            </p>
            <p className="mt-4 max-w-2xl text-[var(--color-text-secondary)]">
              My focus areas right now are Web3 tooling, developer
              automation, and applied AI.
            </p>
            <Button href="/about" variant="text" className="mt-6">
              Read More <ArrowUpRight size={14} />
            </Button>
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="mx-auto max-w-[1280px] px-5 py-16 md:px-8">
        <h2 className="text-2xl font-semibold md:text-3xl">Skills & Technologies</h2>
        <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {skillGroups.map((group) => (
            <div key={group.category}>
              <h3 className="text-sm font-semibold text-[var(--color-text-secondary)]">
                {group.category}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <Badge key={item}>{item}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Writing */}
      <section className="mx-auto max-w-[1280px] px-5 py-16 md:px-8">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-2xl font-semibold md:text-3xl">Writing</h2>
          <Button href="/writing" variant="text" className="hidden md:inline-flex">
            View All <ArrowUpRight size={14} />
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {writing.map((post) => (
            <WritingCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      {/* Research */}
      <section className="mx-auto max-w-[1280px] px-5 py-16 md:px-8">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-2xl font-semibold md:text-3xl">Research</h2>
          <Button href="/research" variant="text" className="hidden md:inline-flex">
            View All <ArrowUpRight size={14} />
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {research.map((paper) => (
            <ResearchCard key={paper.slug} paper={paper} />
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="mx-auto max-w-[1280px] px-5 py-24 md:px-8">
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-10 text-center md:p-16">
          <h2 className="text-3xl font-semibold md:text-4xl">
            Interested in working together?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[var(--color-text-secondary)]">
            Whether you have a project, an opportunity, or simply want to
            connect, I&apos;d love to hear from you.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button href="/contact" variant="primary">
              Contact Me
            </Button>
            <Button href={`mailto:${siteConfig.email}`} variant="secondary">
              Email Me
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
