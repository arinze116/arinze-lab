import siteJson from "@/content/site.json";
import type { SiteContent } from "@/types/site";

// This compatibility export keeps client layout components free from Node.js
// filesystem imports while site.json remains the editable source of truth.
export const siteContent = siteJson as SiteContent;
export const SITE_URL = siteContent.url;

export const siteConfig = {
  name: siteContent.name,
  authorName: siteContent.authorName,
  url: siteContent.url,
  description: siteContent.description,
  email: siteContent.email,
  location: siteContent.location,
  resumeUrl: siteContent.resumeUrl,
  availabilityText: siteContent.availabilityText,
  socials: Object.fromEntries(
    siteContent.socials.map((social) => [social.platform, social.href]),
  ) as Record<string, string>,
};

export const navItems = siteContent.navigation
  .filter((item) => item.visible)
  .sort((a, b) => a.order - b.order);
