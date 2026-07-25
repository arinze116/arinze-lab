import { getAllWriting } from "@/lib/content";
import { WritingExplorer } from "@/components/sections/writing-explorer";

export const metadata = {
  title: "Writing",
  description: "Articles, tutorials, engineering notes, and lessons from building software.",
};

export default function WritingPage() {
  const posts = getAllWriting();
  return (
    <section className="mx-auto max-w-[1280px] px-5 py-16 md:px-8">
      <h1 className="text-3xl font-bold md:text-4xl">Writing</h1>
      <p className="mt-3 max-w-xl text-[var(--color-text-secondary)]">
        A collection of articles, tutorials, engineering notes, and lessons
        from building software.
      </p>
      <div className="mt-10">
        <WritingExplorer posts={posts} />
      </div>
    </section>
  );
}
