import type { Metadata } from "next";
import { getAllWriting } from "@/lib/content";
import { WritingExplorer } from "@/components/sections/writing-explorer";

export const metadata: Metadata = {
  title: "Writing",
  description:
    "Articles, tutorials, engineering notes, and lessons from building software.",
  alternates: { canonical: "/writing" },
  openGraph: {
    title: "Writing",
    description:
      "Articles, tutorials, engineering notes, and lessons from building software.",
    url: "/writing",
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
