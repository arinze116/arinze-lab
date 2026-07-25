import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAllWriting, getWritingBySlug } from "@/lib/content";
import { Badge } from "@/components/ui/badge";

export function generateStaticParams() {
  return getAllWriting().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  try {
    const { meta } = getWritingBySlug(slug);
    return { title: meta.title, description: meta.description };
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
        <h2 id={heading.toLowerCase().replace(/\s+/g, "-")} className="text-xl font-semibold">
          {heading}
        </h2>
        <p className="mt-3 whitespace-pre-line">{body}</p>
      </div>
    );
  });
}

export default async function WritingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let data;
  try {
    data = getWritingBySlug(slug);
  } catch {
    notFound();
  }
  const { meta, content } = data!;
  const all = getAllWriting();
  const idx = all.findIndex((p) => p.slug === meta.slug);
  const prev = all[idx + 1];
  const next = all[idx - 1];

  return (
    <article className="mx-auto max-w-[720px] px-5 py-16 md:px-8">
      <Link href="/writing" className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-white">
        <ArrowLeft size={14} /> Back to Writing
      </Link>

      <div className="mt-6 flex items-center gap-3">
        <Badge>{meta.category}</Badge>
        <span className="text-xs text-[var(--color-text-secondary)]">
          {formatDate(meta.date)} · {meta.readingTime}
        </span>
      </div>
      <h1 className="mt-4 text-3xl font-bold md:text-4xl">{meta.title}</h1>
      <p className="mt-3 text-[var(--color-text-secondary)]">{meta.description}</p>

      <div className="prose-article mt-10">{renderContent(content)}</div>

      <div className="mt-16 flex flex-col gap-4 border-t border-[var(--color-border)] pt-8 sm:flex-row sm:justify-between">
        {prev ? (
          <Link href={`/writing/${prev.slug}`} className="text-sm text-[var(--color-accent)] hover:underline underline-offset-4">
            ← {prev.title}
          </Link>
        ) : <span />}
        {next ? (
          <Link href={`/writing/${next.slug}`} className="text-sm text-[var(--color-accent)] hover:underline underline-offset-4">
            {next.title} →
          </Link>
        ) : <span />}
      </div>
    </article>
  );
}
