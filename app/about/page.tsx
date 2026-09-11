import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbSchema } from "@/lib/schema";
export const metadata: Metadata = {
  title: "About",
  description:
    "Arinze Chinweuba is a software developer and security researcher building practical tools.",
  alternates: { canonical: "/about" },
};
const principles = [
  "Start with the smallest useful system, then make it reliable.",
  "Treat constraints as design inputs, not excuses.",
  "Prefer clear interfaces and inspectable behavior over cleverness.",
  "Document lessons so the next build begins with better questions.",
];
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
          <p className="eyebrow">About</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Building practical systems with an investigative streak.
          </h1>
          <p className="mt-6 max-w-2xl leading-7 text-[var(--color-text-secondary)]">
            I’m Arinze, a developer in Nigeria working across software
            engineering, automation, Telegram bots, Web3 tooling, and security
            research. I build end to end: from the first useful interaction
            through deployment and the maintenance that follows.
          </p>
          <p className="mt-4 max-w-2xl leading-7 text-[var(--color-text-secondary)]">
            A lot of my early work ran from Termux on a phone. That constraint
            taught me to make careful technical choices, keep systems lean, and
            distinguish a working demo from something that can keep running.
          </p>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)]">
          <Image
            src="/images/portrait.svg"
            alt="Portrait of Arinze Chinweuba"
            fill
            className="object-cover"
          />
        </div>
      </section>
      <section className="border-y border-[var(--color-border)]">
        <div className="page-shell grid gap-10 md:grid-cols-2">
          <div>
            <p className="eyebrow">What I build</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight">
              Tools that reduce friction and make risk easier to inspect.
            </h2>
          </div>
          <div className="space-y-5 text-[var(--color-text-secondary)]">
            <p>
              <strong className="text-white">Software & automation.</strong>{" "}
              Backend services and developer tools that turn repetitive
              workflows into dependable systems.
            </p>
            <p>
              <strong className="text-white">Security & Web3.</strong>{" "}
              Contract-risk tooling and research that favors explicit signals
              over false certainty.
            </p>
            <p>
              <strong className="text-white">Applied AI.</strong> Practical
              integrations that improve a specific workflow, rather than AI for
              its own sake.
            </p>
          </div>
        </div>
      </section>
      <section className="page-shell grid gap-10 md:grid-cols-[.75fr_1.25fr]">
        <div>
          <p className="eyebrow">How I work</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">
            Constraint-driven, direct, and maintainable.
          </h2>
        </div>
        <ol className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
          {principles.map((principle, index) => (
            <li key={principle} className="flex gap-5 py-5">
              <span className="font-mono text-xs text-[var(--color-text-faint)]">
                0{index + 1}
              </span>
              <span className="leading-7 text-[var(--color-text-secondary)]">
                {principle}
              </span>
            </li>
          ))}
        </ol>
      </section>
      <section className="page-shell pt-0">
        <div className="border border-[var(--color-border)] p-7">
          <p className="eyebrow">Current direction</p>
          <p className="mt-3 max-w-2xl text-xl leading-8">
            Open to thoughtful software engineering, security, AI automation,
            and Web3 opportunities.
          </p>
          <Button href="/contact" className="mt-6">
            Contact me
          </Button>
        </div>
      </section>
    </>
  );
}
