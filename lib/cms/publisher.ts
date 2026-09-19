import "server-only";
import { getRepositoryFile, putRepositoryFile, deleteRepositoryFile } from "@/lib/github/client";
import { normalizeCollectionData, safeContentPath, validateMarkdown, validateSiteContent } from "@/lib/cms/validation";
import { serializeCmsFile } from "@/lib/cms/parser";
import type { CmsCollection, PublisherResult } from "@/lib/cms/schema";
import type { SiteContent } from "@/types/site";

function message(action: string, label: string): string {
  return `cms: ${action} ${label}`.slice(0, 200);
}

function collectionName(collection: CmsCollection): string {
  return collection === "projects" ? "project" : collection === "writing" ? "writing article" : "research entry";
}

export async function publishCollectionFile(collection: CmsCollection, slug: string, frontmatter: Record<string, unknown>, content: string, action = "update"): Promise<PublisherResult> {
  const meta = normalizeCollectionData(collection, { ...frontmatter, slug });
  const bodyResult = validateMarkdown(content);
  if (!bodyResult.ok) throw new Error(bodyResult.errors.join(" "));
  const path = safeContentPath(collection, slug);
  const existing = await getRepositoryFile(path);
  if (action === "add" && existing) throw new Error("A content entry with that slug already exists.");
  const commitMessage = message(action, `${collectionName(collection)} ${slug}`);
  const response = await putRepositoryFile(path, serializeCmsFile(meta as unknown as Record<string, unknown>, content), commitMessage, existing?.sha);
  return { sha: response.commit?.sha || response.content?.sha || "unknown", commitUrl: response.commit?.html_url || response.content?.html_url, message: commitMessage };
}

export async function deleteCollectionFile(collection: CmsCollection, slug: string): Promise<PublisherResult> {
  const path = safeContentPath(collection, slug);
  const existing = await getRepositoryFile(path);
  if (!existing) throw new Error("Content file does not exist.");
  const commitMessage = message("delete", `${collectionName(collection)} ${slug}`);
  const response = await deleteRepositoryFile(path, commitMessage, existing.sha);
  return { sha: response.commit?.sha || "unknown", commitUrl: response.commit?.html_url, message: commitMessage };
}

export async function renameCollectionFile(collection: CmsCollection, oldSlug: string, newSlug: string, frontmatter: Record<string, unknown>, content: string): Promise<PublisherResult> {
  if (oldSlug === newSlug) return publishCollectionFile(collection, newSlug, frontmatter, content, "update");
  const oldPath = safeContentPath(collection, oldSlug);
  const newPath = safeContentPath(collection, newSlug);
  const oldFile = await getRepositoryFile(oldPath);
  if (!oldFile) throw new Error("The original content file no longer exists.");
  if (await getRepositoryFile(newPath)) throw new Error("The new slug already exists.");

  // The Contents API cannot create a multi-file atomic commit. Validate both
  // paths before the first write and make any partial state visible to history.
  const commitMessage = message("rename", `${collectionName(collection)} ${oldSlug} to ${newSlug}`);
  const created = await putRepositoryFile(newPath, serializeCmsFile({ ...frontmatter, slug: newSlug }, content), commitMessage);
  try {
    const removed = await deleteRepositoryFile(oldPath, commitMessage, oldFile.sha);
    return { sha: removed.commit?.sha || created.commit?.sha || "unknown", commitUrl: removed.commit?.html_url || created.commit?.html_url, message: commitMessage };
  } catch (error) {
    throw new Error(`New slug committed, but the old slug could not be removed. Resolve the duplicate manually. ${error instanceof Error ? error.message : ""}`);
  }
}

export async function publishSiteContent(content: SiteContent): Promise<PublisherResult> {
  const validation = validateSiteContent(content);
  if (!validation.ok) throw new Error(validation.errors.join(" "));
  const path = "content/site.json";
  const existing = await getRepositoryFile(path);
  const commitMessage = message("update", "site settings");
  const response = await putRepositoryFile(path, `${JSON.stringify(content, null, 2)}\n`, commitMessage, existing?.sha);
  return { sha: response.commit?.sha || response.content?.sha || "unknown", commitUrl: response.commit?.html_url || response.content?.html_url, message: commitMessage };
}

export async function publishBinaryMedia(path: string, bytes: Buffer, commitMessage: string): Promise<PublisherResult> {
  const existing = await getRepositoryFile(path);
  const response = await putRepositoryFile(path, bytes, commitMessage, existing?.sha);
  return { sha: response.commit?.sha || response.content?.sha || "unknown", commitUrl: response.commit?.html_url || response.content?.html_url, message: commitMessage };
}

export async function deleteMediaFile(path: string): Promise<PublisherResult> {
  if (!path.startsWith("public/images/cms/") || path.includes("..")) throw new Error("Only CMS-uploaded media can be deleted.");
  const existing = await getRepositoryFile(path);
  if (!existing) throw new Error("Media file does not exist.");
  const commitMessage = `cms: delete media ${path.split("/").pop()}`;
  const response = await deleteRepositoryFile(path, commitMessage, existing.sha);
  return { sha: response.commit?.sha || "unknown", commitUrl: response.commit?.html_url, message: commitMessage };
}
