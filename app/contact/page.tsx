import { Github, Linkedin, Twitter, Mail, MapPin } from "lucide-react";
import { ContactForm } from "@/components/sections/contact-form";
import { siteConfig } from "@/lib/site";

export const metadata = {
  title: "Contact",
  description: "Get in touch with Arinze for projects, collaborations, or questions.",
};

export default function ContactPage() {
  return (
    <section className="mx-auto max-w-[1280px] px-5 py-16 md:px-8">
      <div className="grid gap-12 md:grid-cols-[1fr_360px]">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl">Let&apos;s Connect</h1>
          <p className="mt-4 max-w-lg text-[var(--color-text-secondary)]">
            If you&apos;d like to discuss a project, collaborate, ask a
            question, or simply say hello, feel free to reach out. I&apos;ll
            do my best to respond as soon as possible.
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
            <a href={`mailto:${siteConfig.email}`} className="mt-1 inline-flex items-center gap-2 text-sm text-[var(--color-accent)] hover:underline underline-offset-4">
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
              <a href={siteConfig.socials.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="text-[var(--color-text-secondary)] hover:text-white transition-colors">
                <Github size={18} />
              </a>
              <a href={siteConfig.socials.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="text-[var(--color-text-secondary)] hover:text-white transition-colors">
                <Linkedin size={18} />
              </a>
              <a href={siteConfig.socials.x} target="_blank" rel="noreferrer" aria-label="X" className="text-[var(--color-text-secondary)] hover:text-white transition-colors">
                <Twitter size={18} />
              </a>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
