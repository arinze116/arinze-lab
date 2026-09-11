import { ReactNode } from "react";

const statusColors: Record<string, string> = {
  Live: "text-[var(--color-text-primary)] border-[var(--color-text-primary)]/40 bg-white/5",
  "In Progress":
    "text-[var(--color-text-secondary)] border-[var(--color-border)] bg-[var(--color-surface)]",
  Archived:
    "text-[var(--color-text-faint)] border-[var(--color-border)] bg-[var(--color-surface)]",
  Experimental:
    "text-[var(--color-text-secondary)] border-[var(--color-border)] bg-[var(--color-surface)]",
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
