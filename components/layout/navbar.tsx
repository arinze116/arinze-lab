"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { navItems, siteConfig } from "@/lib/site";
export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  const active = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]/95 backdrop-blur-sm">
      <nav
        className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-5 md:px-8"
        aria-label="Main navigation"
      >
        <Link href="/" className="font-mono text-sm font-medium tracking-tight">
          {siteConfig.name}
        </Link>
        <div className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm transition-colors ${active(item.href) ? "text-white" : "text-[var(--color-text-secondary)] hover:text-white"}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/search"
            aria-label="Search"
            className="grid h-10 w-10 place-items-center text-[var(--color-text-secondary)] hover:text-white"
          >
            <Search size={17} />
          </Link>
          <Link
            href="/resume"
            className="hidden border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium hover:border-white md:block"
          >
            Resume
          </Link>
          <Link
            href="/contact"
            className="hidden bg-white px-3 py-1.5 text-xs font-medium text-black hover:bg-neutral-300 md:block"
          >
            Contact
          </Link>
          <button
            type="button"
            className="grid h-10 w-10 place-items-center md:hidden"
            aria-label={open ? "Close navigation" : "Open navigation"}
            aria-controls="mobile-navigation"
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>
      {open && (
        <div className="border-t border-[var(--color-border)] bg-[var(--color-bg)] px-5 py-5 md:hidden">
          <div className="flex flex-col" onClick={() => setOpen(false)}>
            {[
              ...navItems,
              { label: "Resume", href: "/resume" },
              { label: "Contact", href: "/contact" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`border-b border-[var(--color-border)] py-4 text-lg ${active(item.href) ? "text-white" : "text-[var(--color-text-secondary)]"}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
