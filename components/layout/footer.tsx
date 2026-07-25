import Link from "next/link";
import { Github, Linkedin, Twitter, Mail } from "lucide-react";
import { navigation, site } from "@/data/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[color:var(--color-border)]">
      <div className="mx-auto max-w-[1280px] px-5 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <div className="text-base font-semibold">{site.name}</div>
            <p className="mt-3 max-w-xs text-sm text-[color:var(--color-text-secondary)]">
              A portfolio documenting my work, projects, research, and
              technical writing.
            </p>
          </div>

          <div className="grid grid-flow-col grid-rows-3 gap-x-8 gap-y-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)] transition-colors w-fit"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex gap-4 md:justify-end items-start">
            <Link
              href={site.social.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)] transition-colors"
            >
              <Github size={18} />
            </Link>
            <Link
              href={site.social.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)] transition-colors"
            >
              <Linkedin size={18} />
            </Link>
            <Link
              href={site.social.x}
              target="_blank"
              rel="noreferrer"
              aria-label="X"
              className="text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)] transition-colors"
            >
              <Twitter size={18} />
            </Link>
            <Link
              href={`mailto:${site.email}`}
              aria-label="Email"
              className="text-[color:var(--color-text-secondary)] hover:text-[color:var(--color-text-primary)] transition-colors"
            >
              <Mail size={18} />
            </Link>
          </div>
        </div>

        <div className="mt-10 border-t border-[color:var(--color-border)] pt-6 text-xs text-[color:var(--color-text-secondary)]">
          © {year} {site.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}