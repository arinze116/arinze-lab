import "server-only";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { normalizeCollectionData, validateSlug } from "@/lib/cms/validation";
import { ProjectMeta, WritingMeta, ResearchMeta } from "@/types/content";

const CONTENT_DIR = path.join(process.cwd(), "content");

function readDir(dir: string): string[] {
  const full = path.join(CONTENT_DIR, dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full).filter((file) => file.endsWith(".mdx") && validateSlug(file.replace(/\.mdx$/, "")).ok);
}

function readFile(dir: string, slug: string) {
  const slugResult = validateSlug(slug);
  if (!slugResult.ok) throw new Error("Invalid content slug.");
  const root = path.resolve(CONTENT_DIR, dir);
  const full = path.resolve(root, `${slug}.mdx`);
  if (!full.startsWith(`${root}${path.sep}`)) throw new Error("Invalid content path.");
  return matter(fs.readFileSync(full, "utf-8"));
}

function isPublished(meta: { published?: boolean }): boolean {
  return meta.published !== false;
}

export function getAllProjects(includeUnpublished = false): ProjectMeta[] {
  return readDir("projects").map((file) => {
    const slug = file.replace(/\.mdx$/, "");
    const { data } = readFile("projects", slug);
    return normalizeCollectionData("projects", { ...data, slug });
  }).filter((project) => includeUnpublished || isPublished(project)).sort((a, b) => (b.order ?? b.year) - (a.order ?? a.year));
}

export function getFeaturedProjects(includeUnpublished = false): ProjectMeta[] {
  return getAllProjects(includeUnpublished).filter((project) => project.featured).slice(0, 4);
}

export function getProjectBySlug(slug: string, includeUnpublished = false) {
  const { data, content } = readFile("projects", slug);
  const meta = normalizeCollectionData("projects", { ...data, slug });
  if (!includeUnpublished && !isPublished(meta)) throw new Error("Content is not published.");
  return { meta, content };
}

export function getAllWriting(includeUnpublished = false): WritingMeta[] {
  return readDir("writing").map((file) => {
    const slug = file.replace(/\.mdx$/, "");
    const { data, content } = readFile("writing", slug);
    return { ...normalizeCollectionData("writing", { ...data, slug }), readingTime: `${Math.ceil(readingTime(content).minutes)} min read` };
  }).filter((post) => includeUnpublished || isPublished(post)).sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getWritingBySlug(slug: string, includeUnpublished = false) {
  const { data, content } = readFile("writing", slug);
  const meta = { ...normalizeCollectionData("writing", { ...data, slug }), readingTime: `${Math.ceil(readingTime(content).minutes)} min read` };
  if (!includeUnpublished && !isPublished(meta)) throw new Error("Content is not published.");
  return { meta, content };
}

export function getAllResearch(includeUnpublished = false): ResearchMeta[] {
  return readDir("research").map((file) => {
    const slug = file.replace(/\.mdx$/, "");
    const { data, content } = readFile("research", slug);
    return { ...normalizeCollectionData("research", { ...data, slug }), readingTime: `${Math.ceil(readingTime(content).minutes)} min read` };
  }).filter((paper) => includeUnpublished || isPublished(paper)).sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getResearchBySlug(slug: string, includeUnpublished = false) {
  const { data, content } = readFile("research", slug);
  const meta = { ...normalizeCollectionData("research", { ...data, slug }), readingTime: `${Math.ceil(readingTime(content).minutes)} min read` };
  if (!includeUnpublished && !isPublished(meta)) throw new Error("Content is not published.");
  return { meta, content };
}
