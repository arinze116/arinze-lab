import type { Metadata } from "next";
import { Target, BookOpen, Hammer, Headphones, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Now",
  description: "What Arinze is currently focused on.",
  alternates: { canonical: "/now" },
  openGraph: {
    title: "Now",
    description: "What Arinze is currently focused on.",
    url: "/now",
    type: "website",
  },
};

const nowData = {
  focus: "Building out ArinzeLabs and expanding the Contrax contract scanner.",
  learning: ["Advanced TypeScript", "Rust basics", "Applied machine learning"],
  reading: ["Designing Data-Intensive Applications", "Solana documentation"],
  building: ["ArinzeLabs", "Contrax", "Nexus EVM Bot"],
  listening: ["Lo-fi coding playlists", "Engineering podcasts"],
  updated: "July 2026",
};

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ElementType;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-badge)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
          <Icon size={16} />
        </span>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
          {title}
        </h2>
      </div>
      <div className="mt-5">{children}</div>
    </Card>
  );
}

function BadgeList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <Badge key={item}>{item}</Badge>
      ))}
    </div>
  );
}

export default function NowPage() {
  return (
    <section className="mx-auto max-w-[880px] px-5 py-16 md:px-8">
      <h1 className="text-3xl font-bold md:text-4xl">Now</h1>
      <p className="mt-3 max-w-lg text-[var(--color-text-secondary)]">
        What I&apos;m actively focused on, updated whenever it changes.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Section icon={Target} title="Current Focus">
            <p className="text-lg leading-relaxed">{nowData.focus}</p>
          </Section>
        </div>

        <Section icon={BookOpen} title="Learning">
          <BadgeList items={nowData.learning} />
        </Section>

        <Section icon={Headphones} title="Reading">
          <BadgeList items={nowData.reading} />
        </Section>

        <Section icon={Hammer} title="Building">
          <BadgeList items={nowData.building} />
        </Section>

        <Section icon={Headphones} title="Listening">
          <BadgeList items={nowData.listening} />
        </Section>
      </div>

      <div className="mt-8 flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
        <Clock size={14} />
        Last updated: {nowData.updated}
      </div>
    </section>
  );
}