import { MetadataRoute } from "next";
import { getAllProjects, getAllWriting, getAllResearch } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // /search is intentionally excluded — it is noindex (thin utility page).
  const staticRoutes: MetadataRoute.Sitemap = [
    { path: "", priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/about", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/projects", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/writing", priority: 0.9, changeFrequency: "weekly" as const },
    { path: "/research", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/now", priority: 0.6, changeFrequency: "weekly" as const },
    { path: "/contact", priority: 0.7, changeFrequency: "yearly" as const },
    { path: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" as const },
  ].map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const projectRoutes = getAllProjects().map((p) => ({
    url: `${SITE_URL}/projects/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const writingRoutes = getAllWriting().map((p) => ({
    url: `${SITE_URL}/writing/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "yearly" as const,
    priority: 0.7,
  }));

  const researchRoutes = getAllResearch().map((p) => ({
    url: `${SITE_URL}/research/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "yearly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes, ...writingRoutes, ...researchRoutes];
}
