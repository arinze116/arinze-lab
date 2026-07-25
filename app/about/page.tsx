import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const timeline = [
  { year: "2026", label: "Started programming" },
  { year: "2026", label: "Built first bots and projects" },
  { year: "2026", label: "Launched Arinze Lab" },
];

const skillBadges = [
  "Python", "TypeScript", "JavaScript", "Solidity", "Next.js", "Node.js",
  "Express", "Telegraf", "PostgreSQL", "Firebase", "Supabase", "Docker", "Git", "Linux",
];

const values = [
  "Build things that people can actually use instead of endlessly talking about ideas.",
  "Keep every tool simple enough that I can maintain it myself.",
  "Choose clarity over complexity, even when the clever solution is tempting.",
  "Share what I learn so others can benefit from it too.",
];

const faqs = [
  {
    q: "What technologies do you use?",
    a: "Mostly TypeScript and Python, across Next.js for web, Node.js for bots and services, and Solidity for smart contract work.",
  },
  {
    q: "Are you available for freelance work?",
    a: "Yes, reach out through the contact page with a short description of the project.",
  },
  {
    q: "Can we collaborate?",
    a: "Always open to it, especially on Web3 tooling, bots, and developer automation.",
  },
  {
    q: "Where can I contact you?",
    a: "Through my socials, but email is the most reliable way.",
  },
];

export const metadata = {
  title: "About",
  description: "Arinze's professional background, skills, and values.",
};

export default function AboutPage() {
  return (
    <>
      <section className="mx-auto max-w-[1280px] px-5 py-16 md:px-8">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <h1 className="text-3xl font-bold md:text-4xl">About Me</h1>
            <p className="mt-5 text-[var(--color-text-secondary)]">
              I&apos;m developer based in Enugu, Nigeria,
              working across full-stack web development, Web3
              infrastructure, Telegram bot development, and cybersecurity.
              I build most things end-to-end, design, code, deployment,
              and the maintenance that comes after.
            </p>
            <p className="mt-4 text-[var(--color-text-secondary)]">
              A lot of my early work was built and hosted from a single
              Android phone running Termux, which taught me to build lean
              and think carefully about what a project actually needs to
              run reliably.
            </p>
          </div>
          <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)]">
            <Image src="/images/portrait.svg" alt="Arinze" fill className="object-cover" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 py-16 md:px-8">
        <h2 className="text-2xl font-semibold">Timeline</h2>
        <div className="mt-8 flex flex-col gap-6 border-l border-[var(--color-border)] pl-6">
          {timeline.map((t) => (
            <div key={t.year} className="relative">
              <span className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full bg-[var(--color-accent)]" />
              <span className="text-sm font-semibold text-[var(--color-accent)]">{t.year}</span>
              <p className="mt-1 text-[var(--color-text-secondary)]">{t.label}</p>
            </div>
          ))}
          <div className="relative">
            <span className="absolute -left-[29px] top-1.5 h-2.5 w-2.5 rounded-full bg-[var(--color-border)]" />
            <span className="text-sm font-semibold text-[var(--color-text-secondary)]">Future</span>
            <p className="mt-1 text-[var(--color-text-secondary)]">Growing…</p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 py-16 md:px-8">
        <h2 className="text-2xl font-semibold">Skills & Tools</h2>
        <div className="mt-6 flex flex-wrap gap-2">
          {skillBadges.map((s) => (
            <Badge key={s}>{s}</Badge>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 py-16 md:px-8">
        <h2 className="text-2xl font-semibold">Values</h2>
        <ul className="mt-6 flex flex-col gap-3">
          {values.map((v) => (
            <li key={v} className="text-[var(--color-text-secondary)]">— {v}</li>
          ))}
        </ul>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 py-16 md:px-8">
        <h2 className="text-2xl font-semibold">Frequently Asked Questions</h2>
        <div className="mt-6 flex flex-col divide-y divide-[var(--color-border)] border-t border-[var(--color-border)]">
          {faqs.map((f) => (
            <div key={f.q} className="py-5">
              <p className="font-medium">{f.q}</p>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)]">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-5 py-16 text-center md:px-8">
        <Button href="/contact" variant="primary">Let&apos;s Talk</Button>
      </section>
    </>
  );
}
