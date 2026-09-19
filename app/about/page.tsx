import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/schema";
import { getSiteContent } from "@/lib/site-content";
const siteContent = getSiteContent();
export const metadata: Metadata = {
  title: siteContent.pageSeo.about.title,
  description: siteContent.pageSeo.about.description,
  alternates: { canonical: siteContent.pageSeo.about.canonical },
};
export default function AboutPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "About", path: "/about" },
        ])}
      />
      <section className="page-shell grid items-start gap-10 md:grid-cols-[1.2fr_.8fr]">
        <div>
           <p className="eyebrow">{siteContent.about.eyebrow}</p>
           <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
             {siteContent.about.title}
           </h1>
           {siteContent.about.intro.map((paragraph) => (
             <p key={paragraph} className="mt-6 max-w-2xl leading-7 text-[var(--color-text-secondary)]">
               {paragraph}
             </p>
           ))}
        </div>
        <div className="relative aspect-[4/5] overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)]">
          <Image
             src={siteContent.about.portrait.src}
             alt={siteContent.about.portrait.alt}
            fill
            className="object-cover"
          />
        </div>
      </section>
      <section className="border-y border-[var(--color-border)]">
        <div className="page-shell grid gap-10 md:grid-cols-2">
          <div>
             <p className="eyebrow">{siteContent.about.whatIBuild.eyebrow}</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
               {siteContent.about.whatIBuild.heading}
            </h2>
          </div>
          <div className="space-y-5 text-[var(--color-text-secondary)]">
             {siteContent.about.whatIBuild.items
               .filter((item) => item.visible)
               .sort((a, b) => a.order - b.order)
               .map((item) => (
                 <p key={item.label}>
                   <strong className="text-white">{item.label}.</strong>{" "}
                   {item.body}
                 </p>
               ))}
          </div>
        </div>
      </section>
      <section className="page-shell grid gap-10 md:grid-cols-[.75fr_1.25fr]">
        <div>
           <p className="eyebrow">{siteContent.about.howIWork.eyebrow}</p>
           <h2 className="mt-3 text-3xl font-bold tracking-tight">
             {siteContent.about.howIWork.heading}
           </h2>
         </div>
         <ol className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
           {siteContent.about.howIWork.principles
             .filter((principle) => principle.visible)
             .sort((a, b) => a.order - b.order)
             .map((principle, index) => (
             <li key={principle.text} className="flex gap-5 py-5">
              <span className="font-mono text-xs text-[var(--color-text-faint)]">
                0{index + 1}
              </span>
               <span className="leading-7 text-[var(--color-text-secondary)]">
                 {principle.text}
              </span>
            </li>
          ))}
        </ol>
      </section>
       {siteContent.about.currentDirection.visible && siteContent.about.cta.visible && <section className="page-shell pt-0">
        <div className="border border-[var(--color-border)] p-7">
           <p className="eyebrow">{siteContent.about.currentDirection.eyebrow}</p>
           <p className="mt-3 max-w-2xl text-xl leading-8">
             {siteContent.about.currentDirection.body}
           </p>
           <Button href={siteContent.about.cta.url} className="mt-6">
             {siteContent.about.cta.label}
          </Button>
        </div>
       </section>
       }
     </>
  );
}
