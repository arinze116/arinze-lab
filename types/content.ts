export type ProjectStatus =
  | "Live"
  | "In Progress"
  | "Archived"
  | "Experimental";

export interface ProjectMeta {
  slug: string;
  title: string;
  summary: string;
  cover: string;
  stack: string[];
  status: ProjectStatus;
  year: number;
  categories: string[];
  github?: string;
  telegram?: string;
  demo?: string;
  featured?: boolean;
  published?: boolean;
  order?: number;
  images?: string[];
  seo?: {
    title?: string;
    description?: string;
    image?: string;
  };
}

export interface WritingMeta {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
  readingTime: string;
  tags: string[];
  featuredImage?: string;
  summary?: string;
  topic?: string;
  published?: boolean;
  featured?: boolean;
  order?: number;
  images?: string[];
  seo?: {
    title?: string;
    description?: string;
    image?: string;
  };
}

export interface ResearchMeta {
  slug: string;
  title: string;
  summary: string;
  topic: string;
  date: string;
  readingTime: string;
  description?: string;
  category?: string;
  tags?: string[];
  featuredImage?: string;
  published?: boolean;
  featured?: boolean;
  order?: number;
  images?: string[];
  seo?: {
    title?: string;
    description?: string;
    image?: string;
  };
}
