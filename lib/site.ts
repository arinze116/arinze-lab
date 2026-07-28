// Canonical production origin. Single source of truth for metadataBase,
// the sitemap, robots, canonical tags, JSON-LD, and llms.txt. No trailing slash.
export const SITE_URL = "https://www.arinzelab.vercel.app";

export const siteConfig = {
  name: "ArinzeLab.",
  // Human/legal name of the person behind the site, used in Person JSON-LD.
  authorName: "Arinze Chinweuba",
  url: SITE_URL,
  description:
    "A portfolio documenting my work, projects, research, and technical writing.",
  email: "arinzelabs@gmail.com",
  location: "Nigeria",
  socials: {
    github: "https://github.com/arinze116",
    linkedin: "https://linkedin.com/in/arinze-chinweuba",
    x: "https://x.com/arinze116"
  },
};

export const navItems = [
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Writing", href: "/writing" },
  { label: "Research", href: "/research" },
  { label: "Now", href: "/now" },
  { label: "Contact", href: "/contact" },
];
