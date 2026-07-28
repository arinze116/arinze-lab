import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Github, Send, ArrowUpRight, ArrowLeft } from "lucide-react";
import { getAllProjects, getProjectBySlug } from "@/lib/content";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/json-ld";
import { softwareApplicationSchema, breadcrumbSchema } from "@/lib/schema";

export function generateStaticParams() {
  return getAllProjects().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { meta } = getProjectBySlug(slug);
    const url = `/projects/${slug}`;
    return {
      title: meta.title,
      description: meta.summary,
      alternates: { canonical: url },
      openGraph: {
        title: meta.title,
        description: meta.summary,
        url,
        type: "website",
        images: meta.cover ? [meta.cover] : undefined,
      },
      twitter: {
        card: "summary_large_image",
        title: meta.title,
        description: meta.summary,
        images: meta.cover ? [meta.cover] : undefined,
      },
    };
  } catch {
    return {};
  }
}

// Minimal MDX-body renderer: splits by "## " headings into sections.
function renderContent(content: string) {
  const blocks = content.trim().split(/\n(?=## )/);
  return blocks.map((block, i) => {
    const [headingLine, ...rest] = block.split("\n");
    const heading = headingLine.replace(/^##\s*/, "");
    const body = rest.join("\n").trim();
    return (
      <div key={i} className="mb-8">
        <h2 className="text-xl font-semibold">{heading}</h2>
        <p className="mt-3 whitespace-pre-line text-[var(--color-text-secondary)]">
          {body}
        </p>
      </div>
    );
  });
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let data;
  try {
    data = getProjectBySlug(slug);
  } catch {
    notFound();
  }
  const { meta, content } = data!;
  const allProjects = getAllProjects();
  const related = allProjects
    .filter((p) => p.slug !== meta.slug && p.categories.some((c) => meta.categories.includes(c)))
    .slice(0, 2);

  return (
    <article className="mx-auto max-w-[880px] px-5 py-16 md:px-8">
      <JsonLd
        data={[
          softwareApplicationSchema({
            path: `/projects/${meta.slug}`,
            name: meta.title,
            description: meta.summary,
            image: meta.cover,
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Projects", path: "/projects" },
            { name: meta.title, path: `/projects/${meta.slug}` },
          ]),
        ]}
      />
      <Link href="/projects/" className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-white">
        <ArrowLeft size={14} /> Back to Projects
      </Link>

      <div className="mt-6 flex items-start justify-between gap-4">
        <h1 className="text-3xl font-bold md:text-4xl">{meta.title}</h1>
        <Badge status>{meta.status}</Badge>
      </div>
      <p className="mt-4 text-lg text-[var(--color-text-secondary)]">{meta.summary}</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {meta.stack.map((tech) => (
          <Badge key={tech}>{tech}</Badge>
        ))}
      </div>

      <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]">
        <Image src={meta.cover} alt={`${meta.title} cover`} fill className="object-cover" />
      </div>

      <div className="mt-10 flex flex-wrap gap-4">
        {meta.telegram && (
          <Button href={meta.telegram} variant="primary">
            <Send size={16} /> Try on Telegram
          </Button>
        )}
        {meta.github && (
          <Button href={meta.github} variant="secondary">
            <Github size={16} /> GitHub
          </Button>
        )}
        {meta.demo && (
          <Button href={meta.demo} variant="primary">
            Live Demo <ArrowUpRight size={14} />
          </Button>
        )}
      </div>

      <div className="prose-article mt-12">{renderContent(content)}</div>

      {related.length > 0 && (
        <div className="mt-16 border-t border-[var(--color-border)] pt-8">
          <h2 className="text-lg font-semibold">Related Projects</h2>
          <div className="mt-4 flex flex-col gap-2">
            {related.map((p) => (
              <Link key={p.slug} href={`/projects/${p.slug}`} className="text-[var(--color-accent)] hover:underline underline-offset-4">
                {p.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}