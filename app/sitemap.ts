import { MetadataRoute } from "next";
import { getAllProjects, getAllWriting, getAllResearch } from "@/lib/content";

const BASE_URL = "https://arinzelab.dev";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/about",
    "/projects",
    "/writing",
    "/research",
    "/now",
    "/contact",
    "/search",
    "/privacy-policy",
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
  }));

  const projectRoutes = getAllProjects().map((p) => ({
    url: `${BASE_URL}/projects/${p.slug}`,
    lastModified: new Date(),
  }));

  const writingRoutes = getAllWriting().map((p) => ({
    url: `${BASE_URL}/writing/${p.slug}`,
    lastModified: new Date(p.date),
  }));

  const researchRoutes = getAllResearch().map((p) => ({
    url: `${BASE_URL}/research/${p.slug}`,
    lastModified: new Date(p.date),
  }));

  return [...staticRoutes, ...projectRoutes, ...writingRoutes, ...researchRoutes];
}
