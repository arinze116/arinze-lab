import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { getAllResearch, getResearchBySlug } from "@/lib/content";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/json-ld";
import { articleSchema, breadcrumbSchema } from "@/lib/schema";
import {
  ContentRenderer,
  contentHeadings,
} from "@/components/ui/content-renderer";

export function generateStaticParams() {
  return getAllResearch().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { meta } = getResearchBySlug(slug);
    const url = `/research/${slug}`;
    return {
      title: meta.seo?.title ?? meta.title,
      description: meta.seo?.description ?? meta.summary,
      alternates: { canonical: url },
      openGraph: {
        title: meta.seo?.title ?? meta.title,
        description: meta.seo?.description ?? meta.summary,
        url,
        type: "article",
        publishedTime: meta.date,
      },
      twitter: {
        card: "summary_large_image",
         title: meta.seo?.title ?? meta.title,
         description: meta.seo?.description ?? meta.summary,
         images: meta.seo?.image ?? meta.featuredImage,
      },
    };
  } catch {
    return {};
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
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
  const headings = contentHeadings(content);

  return (
    <article className="mx-auto max-w-[1080px] px-5 py-16 md:px-8">
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
      <Link
        href="/research"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-white"
      >
        <ArrowLeft size={14} /> Back to Research
      </Link>

      <div className="mt-6 flex items-center gap-3">
        <Badge>{meta.topic || meta.category || "Research"}</Badge>
        <span className="text-xs text-[var(--color-text-secondary)]">
          {formatDate(meta.date)} · {meta.readingTime}
        </span>
      </div>
      <h1 className="mt-4 text-3xl font-bold md:text-4xl">{meta.title}</h1>
      <p className="mt-3 text-[var(--color-text-secondary)]">
        {meta.summary || meta.description}
      </p>
      {meta.featuredImage && <Image src={meta.featuredImage} alt={`${meta.title} cover`} width={1200} height={630} className="mt-8 h-auto w-full border border-[var(--color-border)]" />}

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,720px)_180px]">
        <div className="prose-article">
          <ContentRenderer content={content} />
        </div>
        {headings.length > 1 && (
          <aside className="hidden border-l border-[var(--color-border)] pl-4 lg:block">
            <p className="eyebrow">Research outline</p>
            <nav className="mt-4 space-y-3">
              {headings.map((heading) => (
                <a
                  key={heading.id}
                  href={`#${heading.id}`}
                  className="block text-xs leading-5 text-[var(--color-text-secondary)] hover:text-white"
                >
                  {heading.title}
                </a>
              ))}
            </nav>
          </aside>
        )}
      </div>
    </article>
  );
}
