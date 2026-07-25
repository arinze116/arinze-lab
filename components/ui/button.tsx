import Link from "next/link";
import { ReactNode } from "react";

type Variant = "primary" | "secondary" | "text";

interface BaseProps {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] px-5 py-2.5 rounded-[var(--radius-button)]",
  secondary:
    "bg-transparent border border-[var(--color-border)] text-white hover:bg-[var(--color-bg-secondary)] px-5 py-2.5 rounded-[var(--radius-button)]",
  text: "bg-transparent text-[var(--color-accent)] hover:underline underline-offset-4 p-0",
};

const base =
  "inline-flex items-center justify-center gap-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]";

export function Button({
  children,
  variant = "primary",
  className = "",
  href,
  ...rest
}: BaseProps & { href?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const classes = `${base} ${variantClasses[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
