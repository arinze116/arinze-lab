export interface SiteLink {
  label: string;
  href: string;
  visible: boolean;
  order: number;
}

export interface SiteButton extends SiteLink {
  variant?: "primary" | "secondary" | "text";
}

export interface HomepageContent {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    buttons: SiteButton[];
  };
  currentDirection: {
    heading: string;
    body: string;
    visible: boolean;
  };
  selectedWork: {
    eyebrow: string;
    heading: string;
    visible: boolean;
  };
  focusAreas: Array<{ label: string; visible: boolean; order: number }>;
  selectedProjects: Array<{ slug: string; visible: boolean; order: number }>;
  writing: {
    eyebrow: string;
    heading: string;
    description: string;
    selectedPosts: Array<{ slug: string; visible: boolean; order: number }>;
    visible: boolean;
  };
  research: {
    eyebrow: string;
    heading: string;
    description: string;
    selectedResearch: Array<{ slug: string; visible: boolean; order: number }>;
    visible: boolean;
  };
  technicalFocus: {
    eyebrow: string;
    heading: string;
    description: string;
    items: Array<{ label: string; visible: boolean; order: number }>;
    visible: boolean;
  };
  workingNow: {
    eyebrow: string;
    body: string;
    linkLabel: string;
    linkUrl: string;
    visible: boolean;
  };
  opportunities: {
    eyebrow: string;
    heading: string;
    description: string;
    buttonLabel: string;
    buttonUrl: string;
    visible: boolean;
  };
}

export interface AboutContent {
  eyebrow: string;
  title: string;
  intro: string[];
  portrait: { src: string; alt: string };
  whatIBuild: {
    eyebrow: string;
    heading: string;
    items: Array<{ label: string; body: string; visible: boolean; order: number }>;
  };
  howIWork: {
    eyebrow: string;
    heading: string;
    principles: Array<{ text: string; visible: boolean; order: number }>;
  };
  currentDirection: { eyebrow: string; body: string; visible: boolean };
  cta: { label: string; url: string; visible: boolean };
}

export interface NowContent {
  eyebrow: string;
  title: string;
  description: string;
  sections: Array<{
    label: string;
    items: string[];
    visible: boolean;
    order: number;
  }>;
  updatedAt: string;
}

export interface ContactContent {
  eyebrow: string;
  title: string;
  description: string;
  emailLabel: string;
  locationLabel: string;
  elsewhereLabel: string;
}

export interface ResumeContent {
  eyebrow: string;
  title: string;
  role: string;
  summaryLabel: string;
  summary: string;
  skillsLabel: string;
  skills: string[];
  projectsLabel: string;
  researchWritingLabel: string;
  researchWritingDescription: string;
}

export interface SeoContent {
  title: string;
  titleTemplate: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  defaultOgImage?: string;
  twitterImage?: string;
}

export interface PageSeo {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
}

export interface SiteContent {
  version: 1;
  name: string;
  authorName: string;
  url: string;
  description: string;
  email: string;
  location: string;
  resumeUrl: string;
  socials: Array<SiteLink & { platform: string }>;
  navigation: SiteLink[];
  homepage: HomepageContent;
  about: AboutContent;
  now: NowContent;
  contact: ContactContent;
  resume: ResumeContent;
  seo: SeoContent;
  pageSeo: Record<string, PageSeo>;
  availabilityText: string;
}
