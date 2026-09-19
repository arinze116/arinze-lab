import type { Metadata } from "next";
import { getAllWriting } from "@/lib/content";
import { WritingExplorer } from "@/components/sections/writing-explorer";
import { getSiteContent } from "@/lib/site-content";

const siteContent = getSiteContent();

export const metadata: Metadata = {
  title: siteContent.pageSeo.writing.title,
  description: siteContent.pageSeo.writing.description,
  alternates: { canonical: siteContent.pageSeo.writing.canonical },
  openGraph: {
    title: siteContent.pageSeo.writing.title,
    description: siteContent.pageSeo.writing.description,
    url: siteContent.pageSeo.writing.canonical,
    type: "website",
  },
};

export default function WritingPage() {
  const posts = getAllWriting();
  return (
    <section className="page-shell">
      <p className="eyebrow">Engineering notes</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
        Writing from the work.
      </h1>
      <p className="mt-4 max-w-2xl leading-7 text-[var(--color-text-secondary)]">
        Technical investigations, implementation notes, and practical lessons
        from building software.
      </p>
      <div className="mt-10">
        <WritingExplorer posts={posts} />
      </div>
    </section>
  );
}
