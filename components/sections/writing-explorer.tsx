"use client";

import { useMemo, useState } from "react";
import { WritingCard } from "@/components/ui/writing-card";
import { WritingMeta } from "@/types/content";

const categories = ["All", "Development", "Flutter", "Next.js", "Python", "AI", "Career", "Opinion", "Blockchain"];

export function WritingExplorer({ posts }: { posts: WritingMeta[] }) {
  const [active, setActive] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchesCategory = active === "All" || p.category === active;
      const matchesQuery =
        query.trim() === "" || p.title.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [posts, active, query]);

  return (
    <>
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <input
          type="text"
          placeholder="Search articles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full max-w-sm rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-2.5 text-sm text-white placeholder:text-[var(--color-text-secondary)] focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
        />
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`rounded-[var(--radius-badge)] border px-3 py-1.5 text-xs font-medium transition-colors ${
                active === c
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]"
                  : "border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-white"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="py-16 text-center text-[var(--color-text-secondary)]">
          No articles have been published yet. Check back soon.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {filtered.map((post) => (
            <WritingCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </>
  );
}

