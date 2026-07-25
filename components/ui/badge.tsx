import { ReactNode } from "react";

const statusColors: Record<string, string> = {
  Live: "text-[var(--color-success)] border-[var(--color-success)]/30 bg-[var(--color-success)]/10",
  "In Progress":
    "text-[var(--color-warning)] border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10",
  Archived:
    "text-[var(--color-text-secondary)] border-[var(--color-border)] bg-[var(--color-surface)]",
  Experimental:
    "text-[var(--color-accent)] border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10",
};

export function Badge({
  children,
  status,
}: {
  children: ReactNode;
  status?: boolean;
}) {
  const statusClass =
    status && typeof children === "string" ? statusColors[children] : "";

  return (
    <span
      className={`inline-flex items-center rounded-[var(--radius-badge)] border px-2.5 py-1 text-xs font-medium ${
        statusClass ||
        "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]"
      }`}
    >
      {children}
    </span>
  );
}
