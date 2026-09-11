import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
export const metadata: Metadata = {
  title: "Now",
  description: "What Arinze is currently focused on.",
  alternates: { canonical: "/now" },
};
const sections = [
  {
    label: "Building",
    items: ["ArinzeLab", "Contrax contract scanner", "Developer automation"],
  },
  {
    label: "Learning",
    items: ["Advanced TypeScript", "Rust basics", "Applied machine learning"],
  },
  {
    label: "Exploring",
    items: [
      "Web3 tooling",
      "Reliable bot infrastructure",
      "Security heuristics",
    ],
  },
];
export default function NowPage() {
  return (
    <section className="mx-auto max-w-[900px] px-5 py-16 md:px-8">
      <p className="eyebrow">Now</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
        A brief, human update.
      </h1>
      <p className="mt-4 max-w-xl leading-7 text-[var(--color-text-secondary)]">
        A snapshot of what I’m actively building, learning, and testing.
      </p>
      <div className="mt-10 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
        {sections.map((section) => (
          <section
            key={section.label}
            className="grid gap-5 py-7 md:grid-cols-[180px_1fr]"
          >
            <h2 className="font-mono text-sm text-[var(--color-text-secondary)]">
              {section.label}
            </h2>
            <div className="flex flex-wrap gap-2">
              {section.items.map((item) => (
                <Badge key={item}>{item}</Badge>
              ))}
            </div>
          </section>
        ))}
      </div>
      <p className="mt-6 font-mono text-xs text-[var(--color-text-faint)]">
        Last updated: July 2026
      </p>
    </section>
  );
}
