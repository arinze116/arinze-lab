import type { CmsCollection } from "@/lib/cms/schema";
import type { ProjectMeta, ResearchMeta, WritingMeta } from "@/types/content";

export function collectionLabel(collection: CmsCollection): string {
  return collection === "projects" ? "Projects" : collection === "writing" ? "Writing" : "Research";
}

export function collectionItemLabel(collection: CmsCollection, item: ProjectMeta | WritingMeta | ResearchMeta): string {
  const status = item.published === false ? "DRAFT" : "PUBLISHED";
  return `${item.title} [${status}]`;
}

export function previewText(title: string, fields: Array<[string, unknown]>): string {
  const lines = [`ARINZELAB CHANGE PREVIEW`, "", title, "────────────────────", ""];
  for (const [label, value] of fields) lines.push(`${label}\nNEW: ${String(value ?? "(empty)")}\n`);
  lines.push("────────────────────", "No changes have been published.");
  return lines.join("\n");
}

export function csvList(value: string): string[] {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}
