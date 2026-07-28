import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAllResearch, getResearchBySlug } from "@/lib/content";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/json-ld";
import { articleSchema, breadcrumbSchema } from "@/lib/schema";

export function generateStaticParams() {
  return getAllResearch().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { meta } = getResearchBySlug(slug);
    const url = `/research/${slug}`;
    return {
      title: meta.title,
      description: meta.summary,
      alternates: { canonical: url },
      openGraph: {
        title: meta.title,
        description: meta.summary,
        url,
        type: "article",
        publishedTime: meta.date,
      },
      twitter: {
        card: "summary_large_image",
        title: meta.title,
        description: meta.summary,
      },
    };
  } catch {
    return {};
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function renderContent(content: string) {
  const blocks = content.trim().split(/\n(?=## )/);
  return blocks.map((block, i) => {
    const [headingLine, ...rest] = block.split("\n");
    const heading = headingLine.replace(/^##\s*/, "");
    const body = rest.join("\n").trim();
    return (
      <div key={i} className="mb-8">
        <h2 className="text-xl font-semibold">{heading}</h2>
        <p className="mt-3 whitespace-pre-line">{body}</p>
      </div>
    );
  });
}

export default async function ResearchDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let data;
  try {
    data = getResearchBySlug(slug);
  } catch {
    notFound();
  }
  const { meta, content } = data!;

  return (
    <article className="mx-auto max-w-[720px] px-5 py-16 md:px-8">
      <JsonLd
        data={[
          articleSchema({
            path: `/research/${meta.slug}`,
            title: meta.title,
            description: meta.summary,
            datePublished: meta.date,
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Research", path: "/research" },
            { name: meta.title, path: `/research/${meta.slug}` },
          ]),
        ]}
      />
      <Link href="/research" className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-white">
        <ArrowLeft size={14} /> Back to Research
      </Link>

      <div className="mt-6 flex items-center gap-3">
        <Badge>{meta.topic}</Badge>
        <span className="text-xs text-[var(--color-text-secondary)]">
          {formatDate(meta.date)} · {meta.readingTime}
        </span>
      </div>
      <h1 className="mt-4 text-3xl font-bold md:text-4xl">{meta.title}</h1>
      <p className="mt-3 text-[var(--color-text-secondary)]">{meta.summary}</p>

      <div className="prose-article mt-10">{renderContent(content)}</div>
    </article>
  );
}
