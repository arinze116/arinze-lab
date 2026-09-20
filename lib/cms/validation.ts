import type { SiteContent } from "@/types/site";
import type { ProjectMeta, ResearchMeta, WritingMeta } from "@/types/content";

export const MAX_CONTENT_BYTES = 250_000;
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const SAFE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SAFE_PROTOCOLS = new Set(["https:", "http:", "mailto:"]);

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export function result(...errors: string[]): ValidationResult {
  return { ok: errors.length === 0, errors };
}

export function validateSlug(slug: unknown): ValidationResult {
  if (typeof slug !== "string" || slug.length < 1 || slug.length > 48) return result("Slug must be 1-48 characters.");
  if (!SAFE_SLUG.test(slug)) return result("Slug must use lowercase letters, numbers, and hyphens only.");
  return result();
}

export function validateUrl(value: unknown, options: { required?: boolean } = {}): ValidationResult {
  if (value === undefined || value === null || value === "") return options.required ? result("URL is required.") : result();
  if (typeof value !== "string" || value.length > 2_048) return result("URL is invalid or too long.");
  if (/[^\x20-\x7e]/.test(value) || value.startsWith("//")) return result("URL contains unsafe characters.");
  if (value.startsWith("/")) return result();
  try {
    const url = new URL(value);
    return SAFE_PROTOCOLS.has(url.protocol) ? result() : result("Only http, https, and mailto URLs are allowed.");
  } catch {
    return result("URL is invalid.");
  }
}

export function validateAssetPath(value: unknown, options: { required?: boolean } = {}): ValidationResult {
  if (value === undefined || value === null || value === "") return options.required ? result("Asset path is required.") : result();
  if (typeof value !== "string" || value.length > 500 || !value.startsWith("/")) return result("Asset must be a local site path.");
  if (value.includes("..") || /[\u0000-\u001f\u007f]/.test(value) || !/^\/images\/[a-zA-Z0-9_./-]+$/.test(value)) return result("Asset path is unsafe.");
  return result();
}

export function validateEmail(value: unknown): ValidationResult {
  if (typeof value !== "string" || value.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return result("Email address is invalid.");
  return result();
}

export function validateMarkdown(value: unknown): ValidationResult {
  if (typeof value !== "string" || value.trim().length === 0) return result("Content is required.");
  if (Buffer.byteLength(value, "utf8") > MAX_CONTENT_BYTES) return result("Content exceeds the 250 KB limit.");
  if (value.includes("<script") || /<\/?iframe\b/i.test(value) || /\bon[a-z]+\s*=\s*["']?/i.test(value)) return result("Content contains an unsafe HTML construct.");
  return result();
}

function list(value: unknown, label: string, max = 30): string[] {
  if (!Array.isArray(value) || value.length > max || !value.every((item) => typeof item === "string" && item.trim().length > 0 && item.length <= 80)) throw new Error(`${label} must be an array of at most ${max} short strings.`);
  return value.map((item) => item.trim());
}

function requiredString(value: unknown, label: string, max: number): string {
  if (typeof value !== "string" || value.trim().length === 0 || value.length > max) throw new Error(`${label} is required and must be at most ${max} characters.`);
  return value.trim();
}

export function normalizeCollectionData(collection: "projects", input: Record<string, unknown>): ProjectMeta;
export function normalizeCollectionData(collection: "writing", input: Record<string, unknown>): WritingMeta;
export function normalizeCollectionData(collection: "research", input: Record<string, unknown>): ResearchMeta;
export function normalizeCollectionData(collection: "projects" | "writing" | "research", input: Record<string, unknown>): ProjectMeta | WritingMeta | ResearchMeta;
export function normalizeCollectionData(collection: "projects" | "writing" | "research", input: Record<string, unknown>): ProjectMeta | WritingMeta | ResearchMeta {
  const slug = requiredString(input.slug, "slug", 48);
  const slugResult = validateSlug(slug);
  if (!slugResult.ok) throw new Error(slugResult.errors.join(" "));
  if (collection === "projects") {
    const year = Number(input.year);
    if (!Number.isInteger(year) || year < 2000 || year > 2200) throw new Error("Project year is invalid.");
    if (!["Live", "In Progress", "Archived", "Experimental"].includes(String(input.status))) throw new Error("Project status is invalid.");
    const cover = requiredString(input.cover, "cover", 500);
    const coverResult = validateAssetPath(cover, { required: true });
    if (!coverResult.ok) throw new Error(coverResult.errors.join(" "));
    for (const [label, url] of [["github", input.github], ["telegram", input.telegram], ["demo", input.demo]]) {
      const urlResult = validateUrl(url);
      if (!urlResult.ok) throw new Error(`${label}: ${urlResult.errors.join(" ")}`);
    }
    const images = normalizeImageList(input.images);
    const seo = normalizeSeo(input.seo);
    return { slug, title: requiredString(input.title, "title", 160), summary: requiredString(input.summary, "summary", 500), cover, stack: list(input.stack, "stack"), status: input.status as ProjectMeta["status"], year, categories: list(input.categories, "categories"), github: input.github ? requiredString(input.github, "github", 2_048) : undefined, telegram: input.telegram ? requiredString(input.telegram, "telegram", 2_048) : undefined, demo: input.demo ? requiredString(input.demo, "demo", 2_048) : undefined, featured: Boolean(input.featured), published: input.published !== false, order: typeof input.order === "number" ? input.order : undefined, images, seo };
  }
  const date = requiredString(input.date, "date", 32);
  if (Number.isNaN(Date.parse(date))) throw new Error("Date is invalid.");
  const tags = list(input.tags ?? [], "tags");
  const featuredImage = input.featuredImage ? requiredString(input.featuredImage, "featuredImage", 500) : undefined;
  const featuredImageResult = validateAssetPath(featuredImage);
  if (!featuredImageResult.ok) throw new Error(featuredImageResult.errors.join(" "));
  if (collection === "writing") return { slug, title: requiredString(input.title, "title", 160), description: requiredString(input.description, "description", 500), date, category: requiredString(input.category, "category", 80), readingTime: typeof input.readingTime === "string" ? input.readingTime : "", tags, featuredImage, summary: typeof input.summary === "string" ? input.summary : undefined, topic: typeof input.topic === "string" ? input.topic : undefined, published: input.published !== false, featured: Boolean(input.featured), order: typeof input.order === "number" ? input.order : undefined, images: normalizeImageList(input.images), seo: normalizeSeo(input.seo) };
  return { slug, title: requiredString(input.title, "title", 160), summary: requiredString(input.summary ?? input.description, "summary", 500), topic: requiredString(input.topic ?? input.category ?? "Research", "topic", 80), date, readingTime: typeof input.readingTime === "string" ? input.readingTime : "", description: typeof input.description === "string" ? input.description : undefined, category: typeof input.category === "string" ? input.category : undefined, tags, featuredImage, published: input.published !== false, featured: Boolean(input.featured), order: typeof input.order === "number" ? input.order : undefined, images: normalizeImageList(input.images), seo: normalizeSeo(input.seo) };
}

function normalizeImageList(value: unknown): string[] | undefined {
  if (value === undefined) return undefined;
  const images = list(value, "images", 20);
  for (const image of images) {
    const check = validateAssetPath(image);
    if (!check.ok) throw new Error(check.errors.join(" "));
  }
  return images;
}

function normalizeSeo(value: unknown): { title?: string; description?: string; image?: string } | undefined {
  if (value === undefined) return undefined;
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("SEO metadata must be an object.");
  const seo = value as Record<string, unknown>;
  const image = seo.image === undefined ? undefined : requiredString(seo.image, "seo.image", 500);
  const imageCheck = validateAssetPath(image);
  if (!imageCheck.ok) throw new Error(imageCheck.errors.join(" "));
  return { title: seo.title === undefined ? undefined : requiredString(seo.title, "seo.title", 160), description: seo.description === undefined ? undefined : requiredString(seo.description, "seo.description", 500), image };
}

export function validateMediaBytes(bytes: Buffer, claimedMime?: string): ValidationResult {
  if (bytes.length === 0 || bytes.length > MAX_IMAGE_BYTES) return result("Image must be between 1 byte and 8 MB.");
  const isPng = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const isJpeg = bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255]));
  const isWebp = bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP";
  const text = bytes.subarray(0, 4_096).toString("utf8").trimStart();
  const isSvg = text.startsWith("<svg") || (text.startsWith("<?xml") && /<svg\b/i.test(text));
  if (!isPng && !isJpeg && !isWebp && !isSvg) return result("File content is not a supported PNG, JPEG, WebP, or SVG image.");
  if (claimedMime && !["image/png", "image/jpeg", "image/webp", "image/svg+xml"].includes(claimedMime)) return result("MIME type is not supported.");
  const dimensions = isPng ? pngDimensions(bytes) : isJpeg ? jpegDimensions(bytes) : isWebp ? webpDimensions(bytes) : svgDimensions(bytes);
  if (dimensions && (dimensions.width < 1 || dimensions.height < 1 || dimensions.width > 10_000 || dimensions.height > 10_000)) return result("Image dimensions must be between 1 and 10,000 pixels.");
  if (!dimensions && !isSvg) return result("Image dimensions could not be verified.");
  if (isSvg && /<script\b|<foreignObject\b|<iframe\b|<style\b|<a\b|\bon[a-z]+\s*=|javascript:|data:text\/html|(?:xlink:)?href\s*=|@import|url\s*\(|<!ENTITY/i.test(bytes.toString("utf8"))) return result("SVG contains executable, external, or embedded content.");
  return result();
}

function pngDimensions(bytes: Buffer): { width: number; height: number } | null {
  if (bytes.length < 24 || bytes.subarray(12, 16).toString("ascii") !== "IHDR") return null;
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

function jpegDimensions(bytes: Buffer): { width: number; height: number } | null {
  let offset = 2;
  while (offset + 9 < bytes.length) {
    if (bytes[offset] !== 0xff) { offset += 1; continue; }
    const marker = bytes[offset + 1];
    offset += 2;
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) continue;
    const length = bytes.readUInt16BE(offset);
    if (length < 2 || offset + length > bytes.length) return null;
    if ((marker >= 0xc0 && marker <= 0xc3) || (marker >= 0xc5 && marker <= 0xc7) || (marker >= 0xc9 && marker <= 0xcb) || (marker >= 0xcd && marker <= 0xcf)) {
      return { height: bytes.readUInt16BE(offset + 3), width: bytes.readUInt16BE(offset + 5) };
    }
    offset += length;
  }
  return null;
}

function webpDimensions(bytes: Buffer): { width: number; height: number } | null {
  if (bytes.length >= 30 && bytes.subarray(12, 16).toString("ascii") === "VP8X") {
    return { width: 1 + bytes.readUIntLE(24, 3), height: 1 + bytes.readUIntLE(27, 3) };
  }
  if (bytes.subarray(12, 16).toString("ascii") === "VP8 " && bytes.length >= 30) {
    const frame = bytes.indexOf(Buffer.from([0x9d, 0x01, 0x2a]), 20);
    if (frame >= 0 && frame + 7 < bytes.length) return { width: bytes.readUInt16LE(frame + 3) & 0x3fff, height: bytes.readUInt16LE(frame + 5) & 0x3fff };
  }
  if (bytes.subarray(12, 16).toString("ascii") === "VP8L" && bytes.length >= 25 && bytes[21] === 0x2f) {
    const b1 = bytes[22];
    const b2 = bytes[23];
    const b3 = bytes[24];
    const b4 = bytes.length > 25 ? bytes[25] : 0;
    return { width: 1 + (b1 | ((b2 & 0x3f) << 8)), height: 1 + ((b2 >> 6) | (b3 << 2) | ((b4 & 0x0f) << 10)) };
  }
  return null;
}

function svgDimensions(bytes: Buffer): { width: number; height: number } | null {
  const text = bytes.subarray(0, 4_096).toString("utf8");
  const viewBox = text.match(/viewBox\s*=\s*["']\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)\s*["']/i);
  if (viewBox) return { width: Number(viewBox[1]), height: Number(viewBox[2]) };
  const width = text.match(/\bwidth\s*=\s*["']\s*([\d.]+)/i);
  const height = text.match(/\bheight\s*=\s*["']\s*([\d.]+)/i);
  return width && height ? { width: Number(width[1]), height: Number(height[1]) } : null;
}

export function validateSiteContent(value: SiteContent): ValidationResult {
  const errors: string[] = [];
  if (value.version !== 1) errors.push("Unsupported site content version.");
  if (!value.availabilityText || value.availabilityText.length > 240) errors.push("Availability text is invalid.");
  for (const [key, page] of Object.entries(value.pageSeo)) {
    if (!page.title || !page.description) errors.push(`SEO settings for ${key} are incomplete.`);
    if (page.canonical) errors.push(...validateUrl(page.canonical).errors.map((error) => `${key} canonical: ${error}`));
    if (page.image) errors.push(...validateAssetPath(page.image).errors.map((error) => `${key} image: ${error}`));
  }
  for (const [label, url] of [["site URL", value.url], ["canonical URL", value.seo.canonicalUrl], ["resume URL", value.resumeUrl]]) errors.push(...validateUrl(url).errors.map((error) => `${label}: ${error}`));
  errors.push(...validateEmail(value.email).errors);
  for (const item of value.navigation) errors.push(...validateUrl(item.href).errors.map((error) => `navigation ${item.label}: ${error}`));
  for (const social of value.socials) errors.push(...validateUrl(social.href).errors.map((error) => `${social.label}: ${error}`));
  for (const button of value.homepage.hero.buttons) errors.push(...validateUrl(button.href).errors.map((error) => `homepage button ${button.label}: ${error}`));
  errors.push(...validateUrl(value.homepage.workingNow.linkUrl).errors.map((error) => `homepage working-now link: ${error}`));
  errors.push(...validateUrl(value.homepage.opportunities.buttonUrl).errors.map((error) => `homepage CTA: ${error}`));
  errors.push(...validateUrl(value.about.cta.url).errors.map((error) => `about CTA: ${error}`));
  errors.push(...validateAssetPath(value.about.portrait.src, { required: true }).errors.map((error) => `portrait: ${error}`));
  for (const image of [value.seo.defaultOgImage, value.seo.twitterImage]) {
    if (image && !image.startsWith("/opengraph-image") && !image.startsWith("/twitter-image")) errors.push(...validateAssetPath(image).errors.map((error) => `SEO image: ${error}`));
  }
  return { ok: errors.length === 0, errors };
}

export function safeContentPath(collection: "projects" | "writing" | "research", slug: string): string {
  const check = validateSlug(slug);
  if (!check.ok) throw new Error(check.errors.join(" "));
  return `content/${collection}/${slug}.mdx`;
}

export function safeMediaPath(filename: string): string {
  if (/[\\\/]/.test(filename) || filename.includes("..")) {
    throw new Error("Media filename is invalid.");
  }

  const base = filename
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");

  if (!base || base.includes("..")) {
    throw new Error("Media filename is invalid.");
  }

  if (!/\.(png|jpe?g|webp|svg)$/.test(base)) {
    throw new Error("Media must use png, jpg, jpeg, webp, or svg.");
  }

  return `public/images/cms/${base}`;
}

export function safeCollectionMediaPath(
  collection: "projects" | "writing" | "research",
  filename: string,
): string {
  if (/[\\\/]/.test(filename) || filename.includes("..")) {
    throw new Error("Media filename is invalid.");
  }

  const base = filename
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "");

  if (!base || base.includes("..")) {
    throw new Error("Media filename is invalid.");
  }

  if (!/\.(png|jpe?g|webp|svg)$/.test(base)) {
    throw new Error("Media must use png, jpg, jpeg, webp, or svg.");
  }

  return `public/images/${collection}/${base}`;
}
