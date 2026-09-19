import Link from "next/link";
import { Github, Linkedin, Mail, Twitter } from "lucide-react";
import { navItems, siteConfig } from "@/lib/site";
export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)]">
      <div className="mx-auto max-w-[1280px] px-5 py-10 md:px-8">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_auto]">
          <div>
            <p className="font-mono text-sm">{siteConfig.name}</p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--color-text-secondary)]">
              {siteConfig.description}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-[var(--color-text-secondary)]">
            {[
              ...navItems,
              { label: "Now", href: "/now" },
              { label: "Privacy", href: "/privacy-policy" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex gap-4 text-[var(--color-text-secondary)]">
            <a
              href={siteConfig.socials.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="hover:text-white"
            >
              <Github size={18} />
            </a>
            <a
              href={siteConfig.socials.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="hover:text-white"
            >
              <Linkedin size={18} />
            </a>
            <a
              href={`mailto:${siteConfig.email}`}
              aria-label="Email"
              className="hover:text-white"
            >
              <Mail size={18} />
            </a>
            {siteConfig.socials.x && (
              <a
                href={siteConfig.socials.x}
                target="_blank"
                rel="noreferrer"
                aria-label="X"
                className="hover:text-white"
              >
                <Twitter size={18} />
              </a>
            )}
          </div>
        </div>
        <div className="mt-10 flex flex-wrap justify-between gap-2 border-t border-[var(--color-border)] pt-5 font-mono text-xs text-[var(--color-text-faint)]">
          <span>© {new Date().getFullYear()} ArinzeLab.</span>
          <span>{siteConfig.availabilityText}</span>
        </div>
      </div>
    </footer>
  );
}
