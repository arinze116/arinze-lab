"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ProjectMeta, WritingMeta, ResearchMeta } from "@/types/content";

export function SearchClient({
  projects,
  writing,
  research,
}: {
  projects: ProjectMeta[];
  writing: WritingMeta[];
  research: ResearchMeta[];
}) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const matchedProjects = useMemo(
    () => (q ? projects.filter((p) => p.title.toLowerCase().includes(q)) : []),
    [q, projects]
  );
  const matchedWriting = useMemo(
    () => (q ? writing.filter((p) => p.title.toLowerCase().includes(q)) : []),
    [q, writing]
  );
  const matchedResearch = useMemo(
    () => (q ? research.filter((p) => p.title.toLowerCase().includes(q)) : []),
    [q, research]
  );

  const totalResults = matchedProjects.length + matchedWriting.length + matchedResearch.length;

  return (
    <div>
      <input
        type="text"
        autoFocus
        placeholder="Search projects, writing, research..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full max-w-lg rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4 py-3 text-sm text-white placeholder:text-[var(--color-text-secondary)] focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
      />

      {q && totalResults === 0 && (
        <div className="mt-10">
          <p className="text-[var(--color-text-secondary)]">No results found.</p>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Try browsing{" "}
            <Link href="/projects" className="text-[var(--color-accent)] hover:underline underline-offset-4">
              Projects
            </Link>
            ,{" "}
            <Link href="/writing" className="text-[var(--color-accent)] hover:underline underline-offset-4">
              Writing
            </Link>{" "}
            or{" "}
            <Link href="/research" className="text-[var(--color-accent)] hover:underline underline-offset-4">
              Research
            </Link>{" "}
            instead.
          </p>
        </div>
      )}

      {matchedProjects.length > 0 && (
        <div className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">Projects</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {matchedProjects.map((p) => (
              <li key={p.slug}>
                <Link href={`/projects/${p.slug}`} className="text-[var(--color-accent)] hover:underline underline-offset-4">
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {matchedWriting.length > 0 && (
        <div className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">Writing</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {matchedWriting.map((p) => (
              <li key={p.slug}>
                <Link href={`/writing/${p.slug}`} className="text-[var(--color-accent)] hover:underline underline-offset-4">
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {matchedResearch.length > 0 && (
        <div className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">Research</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {matchedResearch.map((p) => (
              <li key={p.slug}>
                <Link href={`/research/${p.slug}`} className="text-[var(--color-accent)] hover:underline underline-offset-4">
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
