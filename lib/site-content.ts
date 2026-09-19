import fs from "fs";
import path from "path";
import type { SiteContent } from "@/types/site";
import { validateSiteContent } from "@/lib/cms/validation";

const SITE_CONTENT_PATH = path.join(process.cwd(), "content", "site.json");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isOrderedItem(value: unknown): boolean {
  return (
    isRecord(value) &&
    isString(value.label) &&
    isBoolean(value.visible) &&
    isNumber(value.order)
  );
}

function isSiteContent(value: unknown): value is SiteContent {
  if (!isRecord(value) || value.version !== 1) return false;
  if (!["name", "authorName", "url", "description", "email", "location", "resumeUrl", "availabilityText"].every((key) => isString(value[key]))) return false;
  if (!Array.isArray(value.socials) || !value.socials.every((item) => isRecord(item) && isString(item.platform) && isString(item.label) && isString(item.href) && isBoolean(item.visible) && isNumber(item.order))) return false;
  if (!Array.isArray(value.navigation) || !value.navigation.every(isOrderedItem)) return false;
  const homepage = value.homepage;
  const contact = value.contact;
  const resume = value.resume;
  if (!isRecord(homepage) || !isRecord(value.about) || !isRecord(value.now) || !isRecord(contact) || !isRecord(resume) || !isRecord(value.seo)) return false;
  const selectedWork = homepage.selectedWork;
  if (!isRecord(selectedWork) || !isString(selectedWork.eyebrow) || !isString(selectedWork.heading) || !isBoolean(selectedWork.visible)) return false;
  if (!["eyebrow", "title", "description", "emailLabel", "locationLabel", "elsewhereLabel"].every((key) => isString(contact[key]))) return false;
  if (!["eyebrow", "title", "role", "summaryLabel", "summary", "skillsLabel", "projectsLabel", "researchWritingLabel", "researchWritingDescription"].every((key) => isString(resume[key]))) return false;
  if (!Array.isArray(resume.skills) || !resume.skills.every(isString)) return false;
  if (!isRecord(value.pageSeo) || !Object.values(value.pageSeo).every((page) => isRecord(page) && isString(page.title) && isString(page.description))) return false;
  return true;
}

export function getSiteContent(): SiteContent {
  try {
    const raw = fs.readFileSync(SITE_CONTENT_PATH, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (isSiteContent(parsed)) {
      const validation = validateSiteContent(parsed);
      if (validation.ok) return parsed;
    }
  } catch {
    // The fallback keeps the site buildable if a local content file is missing.
  }

  throw new Error("Invalid or missing content/site.json");
}

export function getVisibleNavigation(): SiteContent["navigation"] {
  return getSiteContent().navigation
    .filter((item) => item.visible)
    .sort((a, b) => a.order - b.order);
}

export function getVisibleSocials(): SiteContent["socials"] {
  return getSiteContent().socials
    .filter((item) => item.visible)
    .sort((a, b) => a.order - b.order);
}

export function getSiteContentPath(): string {
  return SITE_CONTENT_PATH;
}
