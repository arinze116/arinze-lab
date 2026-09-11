import type { Metadata } from "next";
import { Github, Linkedin, Twitter, Mail, MapPin } from "lucide-react";
import { ContactForm } from "@/components/sections/contact-form";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Arinze for projects, collaborations, or questions.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact",
    description:
      "Get in touch with Arinze for projects, collaborations, or questions.",
    url: "/contact",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <section className="page-shell">
      <div className="grid gap-12 md:grid-cols-[1fr_360px]">
        <div>
          <p className="eyebrow">Opportunities & collaboration</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Let&apos;s connect.
          </h1>
          <p className="mt-4 max-w-lg text-[var(--color-text-secondary)]">
            Open to software engineering, security, AI automation, and Web3
            opportunities. Send a short note about what you&apos;re working on
            or where you think I could help.
          </p>
          <div className="mt-10 max-w-lg">
            <ContactForm />
          </div>
        </div>

        <aside className="flex flex-col gap-6 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6 md:h-fit">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
              Business Email
            </p>
            <a
              href={`mailto:${siteConfig.email}`}
              className="mt-1 inline-flex items-center gap-2 text-sm text-[var(--color-accent)] hover:underline underline-offset-4"
            >
              <Mail size={14} /> {siteConfig.email}
            </a>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
              Location
            </p>
            <p className="mt-1 inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
              <MapPin size={14} /> {siteConfig.location}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">
              Elsewhere
            </p>
            <div className="mt-2 flex items-center gap-4">
              <a
                href={siteConfig.socials.github}
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub"
                className="text-[var(--color-text-secondary)] hover:text-white transition-colors"
              >
                <Github size={18} />
              </a>
              <a
                href={siteConfig.socials.linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="text-[var(--color-text-secondary)] hover:text-white transition-colors"
              >
                <Linkedin size={18} />
              </a>
              <a
                href={siteConfig.socials.x}
                target="_blank"
                rel="noreferrer"
                aria-label="X"
                className="text-[var(--color-text-secondary)] hover:text-white transition-colors"
              >
                <Twitter size={18} />
              </a>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
