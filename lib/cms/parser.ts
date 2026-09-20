import matter from "gray-matter";
import readingTime from "reading-time";
import { normalizeCollectionData } from "@/lib/cms/validation";
import type { CmsCollection, CmsEntity } from "@/lib/cms/schema";

export function parseCmsFile(collection: CmsCollection, slug: string, raw: string): { meta: CmsEntity; content: string } {
  const parsed = matter(raw);
  const meta = normalizeCollectionData(collection, { ...parsed.data, slug });
  return { meta: { ...meta, readingTime: `${Math.ceil(readingTime(parsed.content).minutes)} min read` } as CmsEntity, content: `${parsed.content.trim()}\n` };
}

function removeUndefined(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(removeUndefined);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([, entry]) => entry !== undefined)
      .map(([key, entry]) => [key, removeUndefined(entry)])
  );
}

export function serializeCmsFile(
  meta: Record<string, unknown>,
  content: string
): string {
  const frontmatter = removeUndefined({ ...meta }) as Record<string, unknown>;

  delete frontmatter.slug;
  delete frontmatter.readingTime;

  return matter.stringify(`${content.trim()}\n`, frontmatter);
}

export function diffSummary(before: string | undefined, after: string): string {
  if (!before) return "New content file";
  if (before === after) return "No content changes";
  return `Content changed (${before.split("\n").length} -> ${after.split("\n").length} lines)`;
}
