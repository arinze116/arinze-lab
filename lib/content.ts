import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { ProjectMeta, WritingMeta, ResearchMeta } from "@/types/content";

const CONTENT_DIR = path.join(process.cwd(), "content");

function readDir(dir: string): string[] {
  const full = path.join(CONTENT_DIR, dir);
  if (!fs.existsSync(full)) return [];
  return fs.readdirSync(full).filter((f) => f.endsWith(".mdx"));
}

function readFile(dir: string, slug: string) {
  const full = path.join(CONTENT_DIR, dir, `${slug}.mdx`);
  const raw = fs.readFileSync(full, "utf-8");
  return matter(raw);
}

// ---------- Projects ----------

export function getAllProjects(): ProjectMeta[] {
  return readDir("projects")
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const { data } = readFile("projects", slug);
      return { slug, ...data } as ProjectMeta;
    })
    .sort((a, b) => b.year - a.year);
}

export function getFeaturedProjects(): ProjectMeta[] {
  return getAllProjects()
    .filter((p) => p.featured)
    .slice(0, 4);
}

export function getProjectBySlug(slug: string) {
  const { data, content } = readFile("projects", slug);
  return { meta: { slug, ...data } as ProjectMeta, content };
}

// ---------- Writing ----------

export function getAllWriting(): WritingMeta[] {
  return readDir("writing")
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const { data, content } = readFile("writing", slug);
      return {
        slug,
        readingTime: Math.ceil(readingTime(content).minutes) + " min read",
        ...data,
      } as WritingMeta;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getWritingBySlug(slug: string) {
  const { data, content } = readFile("writing", slug);
  return {
    meta: {
      slug,
      readingTime: Math.ceil(readingTime(content).minutes) + " min read",
      ...data,
    } as WritingMeta,
    content,
  };
}

// ---------- Research ----------

export function getAllResearch(): ResearchMeta[] {
  return readDir("research")
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const { data, content } = readFile("research", slug);
      return {
        slug,
        readingTime: Math.ceil(readingTime(content).minutes) + " min read",
        ...data,
      } as ResearchMeta;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getResearchBySlug(slug: string) {
  const { data, content } = readFile("research", slug);
  return {
    meta: {
      slug,
      readingTime: Math.ceil(readingTime(content).minutes) + " min read",
      ...data,
    } as ResearchMeta,
    content,
  };
}
