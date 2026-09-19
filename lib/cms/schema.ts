import type { SiteContent } from "@/types/site";
import type { ProjectMeta, ResearchMeta, WritingMeta } from "@/types/content";

export type CmsCollection = "projects" | "writing" | "research";
export type CmsEntity = ProjectMeta | WritingMeta | ResearchMeta;
export type CmsOperation = "create" | "update" | "delete" | "publish" | "unpublish";

export interface CmsFile {
  path: string;
  content: string;
  sha?: string;
}

export interface CmsPreview {
  id: string;
  title: string;
  summary: string;
  files: CmsFile[];
  createdAt: number;
  expiresAt: number;
}

export interface CmsSession {
  id: string;
  userId: number;
  chatId: number;
  action: string;
  step: string;
  draft: Record<string, unknown>;
  collection?: CmsCollection;
  slug?: string;
  expiresAt: number;
  preview?: CmsPreview;
}

export interface PublisherResult {
  sha: string;
  commitUrl?: string;
  message: string;
}

export type SiteContentDraft = SiteContent;
