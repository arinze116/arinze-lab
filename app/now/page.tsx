import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { getSiteContent } from "@/lib/site-content";
const siteContent = getSiteContent();
export const metadata: Metadata = {
  title: siteContent.pageSeo.now.title,
  description: siteContent.pageSeo.now.description,
  alternates: { canonical: siteContent.pageSeo.now.canonical },
};
export default function NowPage() {
  return (
    <section className="mx-auto max-w-[900px] px-5 py-16 md:px-8">
      <p className="eyebrow">{siteContent.now.eyebrow}</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
        {siteContent.now.title}
      </h1>
      <p className="mt-4 max-w-xl leading-7 text-[var(--color-text-secondary)]">
        {siteContent.now.description}
      </p>
      <div className="mt-10 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
         {siteContent.now.sections
           .filter((section) => section.visible)
           .sort((a, b) => a.order - b.order)
           .map((section) => (
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
         Last updated: {new Date(siteContent.now.updatedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
      </p>
    </section>
  );
}
