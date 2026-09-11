import { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] transition-colors duration-200 hover:border-[var(--color-text-secondary)]/60 ${className}`}
    >
      {children}
    </div>
  );
}
