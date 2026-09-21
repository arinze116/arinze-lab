import { getAllProjects, getAllResearch, getAllWriting, getProjectBySlug, getResearchBySlug, getWritingBySlug } from "@/lib/content";
import { getCmsHistory, createBackupSnapshot } from "@/lib/cms/history";
import { deleteCollectionFile, deleteMediaFile, publishBinaryMedia, publishCollectionFile, publishSiteContent, renameCollectionFile } from "@/lib/cms/publisher";
import { findLocalMediaReferences, listLocalMedia, prepareCollectionMedia, prepareMedia } from "@/lib/cms/media";
import { MAX_IMAGE_BYTES, validateAssetPath, validateMarkdown, validateSlug, validateUrl } from "@/lib/cms/validation";
import { genericOperationId } from "@/lib/telegram/auth";
import { revertRepositoryCommit } from "@/lib/github/client";
import { getSiteContent } from "@/lib/site-content";
import { adminKeyboard, cancelKeyboard, collectionKeyboard, confirmKeyboard } from "@/lib/telegram/keyboards";
import { answerCallbackQuery, downloadFile, sendMessage, truncateTelegram } from "@/lib/telegram/api";
import { commandArguments, boundedText } from "@/lib/telegram/limits";
import { collectionItemLabel, collectionLabel, csvList, previewText } from "@/lib/telegram/format";
import { createSession, deleteSession, getActiveSession, readSession, saveSession, sessionButton } from "@/lib/telegram/session";
import type { CmsCollection, CmsSession } from "@/lib/cms/schema";
import type { TelegramCallbackQuery, TelegramMessage, TelegramUpdate } from "@/lib/telegram/types";

const collections = new Set<CmsCollection>(["projects", "writing", "research"]);
const fieldSets: Record<CmsCollection, Array<{ key: string; label: string; optional?: boolean }>> = {
  projects: [
    { key: "title", label: "Project name" }, { key: "slug", label: "Slug" }, { key: "summary", label: "Summary" },
    { key: "cover", label: "Cover image — upload a Telegram image, or send the site path" }, { key: "year", label: "Year" },
    { key: "status", label: "Status: Live, In Progress, Archived, or Experimental" }, { key: "categories", label: "Categories, comma separated" },
    { key: "stack", label: "Technology stack, comma separated" }, { key: "github", label: "GitHub URL", optional: true }, { key: "telegram", label: "Telegram URL", optional: true },
    { key: "demo", label: "Demo URL", optional: true }, { key: "images", label: "Gallery paths, comma separated", optional: true }, { key: "featured", label: "Featured? yes/no" }, { key: "published", label: "Published? yes/no" },
    { key: "content", label: "Case study content (send Markdown text or a .md/.mdx file)" },
  ],
  writing: [
    { key: "title", label: "Article title" }, { key: "slug", label: "Slug" }, { key: "description", label: "Excerpt" }, { key: "date", label: "Publication date (YYYY-MM-DD)" },
    { key: "category", label: "Topic" }, { key: "tags", label: "Tags, comma separated" }, { key: "featuredImage", label: "Cover image — upload a Telegram image, or send the site path", optional: true },
    { key: "images", label: "Inline image paths, comma separated", optional: true }, { key: "featured", label: "Featured? yes/no" }, { key: "published", label: "Published? yes/no" }, { key: "content", label: "Article content (send Markdown text or a .md/.mdx file)" },
  ],
  research: [
    { key: "title", label: "Research title" }, { key: "slug", label: "Slug" }, { key: "summary", label: "Summary" }, { key: "date", label: "Publication date (YYYY-MM-DD)" },
    { key: "topic", label: "Topic" }, { key: "tags", label: "Tags, comma separated" }, { key: "featuredImage", label: "Cover image — upload a Telegram image, or send the site path", optional: true },
    { key: "images", label: "Figure paths, comma separated", optional: true }, { key: "featured", label: "Featured? yes/no" }, { key: "published", label: "Published? yes/no" }, { key: "content", label: "Research content (send Markdown text or a .md/.mdx file)" },
  ],
};

function messageContext(message: TelegramMessage) {
  return { userId: message.from?.id || 0, chatId: message.chat.id };
}

function collectionItems(collection: CmsCollection) {
  return collection === "projects" ? getAllProjects(true) : collection === "writing" ? getAllWriting(true) : getAllResearch(true);
}

function collectionEntry(collection: CmsCollection, slug: string) {
  return collectionItems(collection).find((item) => item.slug === slug);
}

function collectionContent(collection: CmsCollection, slug: string): string {
  return collection === "projects" ? getProjectBySlug(slug, true).content : collection === "writing" ? getWritingBySlug(slug, true).content : getResearchBySlug(slug, true).content;
}

function fieldValueLabel(value: unknown): string {
  if (Array.isArray(value)) return value.join(", ");
  return String(value ?? "(empty)");
}

function listCollection(collection: CmsCollection) {
  const items = collectionItems(collection);
  const rows = items.length ? items.map((item, index) => `${index + 1}. ${collectionItemLabel(collection, item)}\n   /${collection === "projects" ? "editproject" : collection === "writing" ? "editarticle" : "editresearch"} ${item.slug}`) : ["No entries found."];
  return `${collectionLabel(collection).toUpperCase()}\n\n${rows.join("\n")}`;
}

function siteValue(path: string): unknown {
  const site = getSiteContent() as unknown as Record<string, unknown>;
  return path.split(".").reduce<unknown>((value, key) => value && typeof value === "object" ? (value as Record<string, unknown>)[key] : undefined, site);
}

function setSiteValue(path: string, value: string): ReturnType<typeof getSiteContent> {
  if (path.split(".").some((part) => ["__proto__", "prototype", "constructor"].includes(part))) throw new Error("This site setting is not editable through Telegram.");
  const site = structuredClone(getSiteContent());
  const keys = path.split(".");
  let cursor: unknown = site;
  for (const key of keys.slice(0, -1)) {
    if (!cursor || typeof cursor !== "object") throw new Error("Unknown site setting.");
    cursor = (cursor as Record<string, unknown>)[key];
  }
  if (!cursor || typeof cursor !== "object") throw new Error("Unknown site setting.");
  const key = keys[keys.length - 1];
  if (!["name", "email", "description", "title", "body", "updatedAt", "url", "canonicalUrl", "hero", "eyebrow", "label", "href", "visible", "order", "heading", "buttonLabel", "buttonUrl", "text"].includes(key) && !path.startsWith("seo.") && !/^about\.intro\.\d+$/.test(path) && !/^about\.howIWork\.principles\.\d+\.text$/.test(path) && !/^homepage\.(focusAreas|selectedProjects|writing\.selectedPosts|research\.selectedResearch|technicalFocus\.items)\.\d+\.(label|slug|visible|order)$/.test(path) && !/^now\.sections\.\d+\.(label|items|visible|order)$/.test(path) && !/^navigation\.\d+\.(label|href|visible|order)$/.test(path) && !/^socials\.\d+\.(label|href|visible|order)$/.test(path)) throw new Error("This site setting is not editable through Telegram.");
  const currentValue = siteValue(path);
  let parsedValue: unknown = value;
  if (typeof currentValue === "boolean") {
    if (!["yes", "no", "true", "false"].includes(value.toLowerCase())) throw new Error("Use yes or no.");
    parsedValue = ["yes", "true"].includes(value.toLowerCase());
  } else if (typeof currentValue === "number") {
    const number = Number(value);
    if (!Number.isInteger(number)) throw new Error("Use a whole number.");
    parsedValue = number;
  } else if (Array.isArray(currentValue)) {
    const values = csvList(value);
    if (!values.length) throw new Error("Enter at least one comma-separated value.");
    parsedValue = values;
  }
  if (path === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new Error("Email address is invalid.");
  if (path === "url" || path === "seo.canonicalUrl" || path.endsWith("Url") || key === "href") {
    const urlResult = validateUrl(value);
    if (!urlResult.ok) throw new Error(urlResult.errors.join(" "));
  }
  (cursor as Record<string, unknown>)[key] = parsedValue;
  return site;
}

async function beginPortraitUpload(chatId: number, userId: number) {
  const id = await createSession(userId, chatId, "portrait-upload", {
    oldValue: String(siteValue("about.portrait.src") ?? ""),
  });

  const session = await readSession(id);

  if (session) {
    session.step = "portrait";
    await saveSession(session);
  }

  await sendMessage(
    chatId,
    `ABOUT PORTRAIT

Current image:
${siteValue("about.portrait.src") || "(empty)"}

Send the new portrait as a Telegram photo or image document.

Maximum size: 8 MB. No changes will be published until you confirm the preview.`,
    { reply_markup: cancelKeyboard() },
  );
}

async function beginSiteEdit(chatId: number, userId: number, path: string) {
  const id = await createSession(userId, chatId, "site-edit", { path, oldValue: String(siteValue(path) ?? "") });
  await sendMessage(chatId, `Step 1/1\n\n${path}\n\nCurrent value:\n${truncateTelegram(String(siteValue(path) ?? "(empty)"), 1_000)}\n\nSend the new value.`, { reply_markup: cancelKeyboard() });
  return id;
}

async function beginSiteSelection(chatId: number, userId: number, kind: "project" | "writing" | "research", slug: string) {
  const site = structuredClone(getSiteContent());
  const exists = kind === "project" ? getAllProjects().some((item) => item.slug === slug) : kind === "writing" ? getAllWriting().some((item) => item.slug === slug) : getAllResearch().some((item) => item.slug === slug);
  if (!exists) {
    await sendMessage(chatId, "That published content entry does not exist.");
    return;
  }
  const collection = kind === "project" ? site.homepage.selectedProjects : kind === "writing" ? site.homepage.writing.selectedPosts : site.homepage.research.selectedResearch;
  const current = collection.find((item) => item.slug === slug);
  if (current) current.visible = true;
  else collection.push({ slug, visible: true, order: collection.length + 1 });
  const id = await createSession(userId, chatId, "site-config", { updatedSite: site, label: `${kind} ${slug}` });
  const session = await readSession(id);
  if (session) { session.step = "preview"; await saveSession(session); }
  await sendMessage(chatId, `ARINZELAB CHANGE PREVIEW\n\nHomepage selection\n\n${kind}: ${slug}\n\nThis entry will be visible on the homepage.\n\nNo changes have been published.`, { reply_markup: confirmKeyboard(id) });
}

async function beginCollection(chatId: number, userId: number, collection: CmsCollection, slug?: string) {
  const existing = slug ? collectionItems(collection).find((item) => item.slug === slug) : undefined;
  if (slug && !existing) {
    await sendMessage(chatId, `No ${collection.slice(0, -1)} found for slug: ${slug}`);
    return;
  }
  let existingContent = "";
  if (existing && slug) {
    existingContent = collection === "projects" ? getProjectBySlug(slug, true).content : collection === "writing" ? getWritingBySlug(slug, true).content : getResearchBySlug(slug, true).content;
  }
  const draft = existing ? { ...(existing as unknown as Record<string, unknown>), slug, content: existingContent } : { published: true, featured: false };
  const id = await createSession(userId, chatId, "content", draft);
  const session = await readSession(id);
  if (session) {
    session.collection = collection;
    session.slug = slug;
    session.step = "0";
    await saveSession(session);
  }
  await askCollectionField(chatId, id, collection, 0, Boolean(existing));
}

async function beginFieldEdit(chatId: number, userId: number, collection: CmsCollection, slug: string, key: string) {
  const item = collectionEntry(collection, slug);
  if (!item) {
    await sendMessage(chatId, "This content entry no longer exists.");
    return;
  }
  const field = fieldSets[collection].find((candidate) => candidate.key === key);
  if (!field) {
    await sendMessage(chatId, "That field is not editable.");
    return;
  }
  const draft: Record<string, unknown> = {
    key,
    oldValue: key === "content" ? collectionContent(collection, slug) : (item as unknown as Record<string, unknown>)[key],
    value: key === "content" ? collectionContent(collection, slug) : (item as unknown as Record<string, unknown>)[key],
    frontmatter: { ...(item as unknown as Record<string, unknown>) },
    content: collectionContent(collection, slug),
  };
  const id = await createSession(userId, chatId, "field-edit", draft);
  const session = await readSession(id);
  if (session) {
    session.collection = collection;
    session.slug = slug;
    session.step = "field";
    await saveSession(session);
  }
  await sendMessage(chatId, `EDIT ${collection.slice(0, -1).toUpperCase()}\n\n${field.label}\n\nCurrent value:\n${truncateTelegram(fieldValueLabel(draft.oldValue), 1_500)}\n\nSend the new value or /cancel.`, { reply_markup: cancelKeyboard() });
}

async function sendEditMenu(chatId: number, userId: number, collection: CmsCollection, slug: string) {
  const item = collectionEntry(collection, slug);
  if (!item) {
    await sendMessage(chatId, "No entry found for that slug.");
    return;
  }
  const fields = fieldSets[collection].filter((field) => field.key !== "content");
  const menuId = await createSession(userId, chatId, "edit-menu", { collection, slug });
  const menuSession = await readSession(menuId);
  if (menuSession) {
    menuSession.collection = collection;
    menuSession.slug = slug;
    menuSession.step = "menu";
    await saveSession(menuSession);
  }
  await sendMessage(chatId, `${collectionLabel(collection).toUpperCase()} / ${item.title}\n\nSelect one field. Only the selected field will be changed.`, {
    reply_markup: {
      inline_keyboard: fields.map((field) => [{ text: field.label.slice(0, 35), callback_data: `editfield:${menuId}:${field.key}` }]).concat([[{ text: "Edit content", callback_data: `editfield:${menuId}:content` }], [{ text: "Delete", callback_data: `deleteitem:${menuId}` }], [{ text: "Cancel", callback_data: "cmd:cancel" }]]),
    },
  });
}

async function askCollectionField(chatId: number, sessionId: string, collection: CmsCollection, index: number, editing: boolean) {
  const field = fieldSets[collection][index];
  const total = fieldSets[collection].length;
  await sendMessage(chatId, `Step ${index + 1}/${total}${editing ? " · editing" : ""}\n\n${field.label}\n\nSend /skip for an optional field.`, { reply_markup: cancelKeyboard() });
}

function parseField(key: string, value: string): unknown {
  if (["featured", "published"].includes(key)) {
    if (!["yes", "no", "true", "false"].includes(value.toLowerCase())) throw new Error("Use yes or no.");
    return ["yes", "true"].includes(value.toLowerCase());
  }
  if (key === "year") {
    const year = Number(value);
    if (!Number.isInteger(year) || year < 2000 || year > 2200) throw new Error("Use a valid year.");
    return year;
  }
  if (["categories", "stack", "tags", "images"].includes(key)) {
    const values = csvList(value);
    if (!values.length) throw new Error("Enter at least one item.");
    if (key === "images") {
      for (const image of values) {
        const imageResult = validateAssetPath(image, { required: true });
        if (!imageResult.ok) throw new Error(imageResult.errors.join(" "));
      }
    }
    return values;
  }
  if (["github", "telegram", "demo"].includes(key)) {
    const result = validateUrl(value);
    if (!result.ok) throw new Error(result.errors.join(" "));
  }
  if (["cover", "featuredImage"].includes(key)) {
    const result = validateAssetPath(value, { required: true });
    if (!result.ok) throw new Error(result.errors.join(" "));
  }
  if (key === "slug") {
    const result = validateSlug(value);
    if (!result.ok) throw new Error(result.errors.join(" "));
  }
  if (key === "content") {
    const result = validateMarkdown(value);
    if (!result.ok) throw new Error(result.errors.join(" "));
  }
  return value;
}

async function showCollectionPreview(session: CmsSession) {
  const draft = session.draft;
  const fields = fieldSets[session.collection as CmsCollection].filter((field) => field.key !== "content").map((field) => [field.label, draft[field.key]] as [string, unknown]);
  const text = previewText(`${collectionLabel(session.collection as CmsCollection)} / ${String(draft.title || draft.slug)}`, fields);
  await sendMessage(session.chatId, text, { reply_markup: confirmKeyboard(session.id) });
}

async function publishSession(session: CmsSession) {
  if (session.action === "portrait-upload") {
    const file = await downloadFile(String(session.draft.fileId));

    const mime =
      typeof session.draft.mime === "string"
        ? session.draft.mime
        : undefined;

    const filename = String(
      session.draft.filename || "portrait.webp",
    );

    const media = prepareMedia(
      filename,
      file.bytes,
      mime,
    );

    await publishBinaryMedia(
      media.repositoryPath,
      file.bytes,
      `cms: upload portrait ${filename}`,
    );

    const updated = structuredClone(getSiteContent());

    updated.about.portrait.src = media.publicPath;

    const result = await publishSiteContent(updated);

    await deleteSession(session.id);

    await sendMessage(
      session.chatId,
      `✅ Portrait updated and committed.

Image: ${media.publicPath}
Site settings: ${result.message}
Commit: ${result.sha}

Vercel deployment was triggered by the GitHub commit.`,
    );

    return;
  }

  if (session.action === "site-edit") {
    const path = String(session.draft.path);
    const updated = setSiteValue(path, String(session.draft.value || ""));
    const result = await publishSiteContent(updated);
    await deleteSession(session.id);
    await sendMessage(session.chatId, `✅ Changes committed.\n\n${result.message}\nCommit: ${result.sha}\n\nVercel deployment was triggered by the GitHub commit.`, { parse_mode: "HTML" });
    return;
  }
  if (session.action === "site-config") {
    const result = await publishSiteContent(session.draft.updatedSite as ReturnType<typeof getSiteContent>);
    await deleteSession(session.id);
    await sendMessage(session.chatId, `✅ Homepage selection committed.\n\n${result.message}\nCommit: ${result.sha}\n\nVercel deployment was triggered by the GitHub commit.`);
    return;
  }
  if (session.action === "field-edit") {
    const collection = session.collection as CmsCollection;
    const key = String(session.draft.key);
    const current = collectionEntry(collection, String(session.slug));
    if (!current) throw new Error("Content entry no longer exists.");
    const frontmatter = { ...(current as unknown as Record<string, unknown>) };
    const value = session.draft.value;

    if ((key === "cover" || key === "featuredImage") && session.draft.__uploadedMedia) {
      const uploaded = session.draft.__uploadedMedia as {
        fileId?: string;
        filename?: string;
        mime?: string;
        repositoryPath?: string;
      };

      if (!uploaded.fileId || !uploaded.filename || !uploaded.repositoryPath) {
        throw new Error("Uploaded image metadata is incomplete.");
      }

      const file = await downloadFile(uploaded.fileId);

      const media = prepareCollectionMedia(
        collection,
        uploaded.filename,
        file.bytes,
        uploaded.mime,
      );

      await publishBinaryMedia(
        media.repositoryPath,
        file.bytes,
        `cms: upload ${collection} cover ${uploaded.filename}`,
      );
    }
    const content = key === "content" ? String(value) : collectionContent(collection, String(session.slug));
    if (key !== "content") frontmatter[key] = value;
    delete frontmatter.content;
    const result = key === "slug"
      ? await renameCollectionFile(collection, String(session.slug), String(value), frontmatter, content)
      : await publishCollectionFile(collection, String(session.slug), frontmatter, content, "update");
    await deleteSession(session.id);
    await sendMessage(session.chatId, `✅ Field updated and committed.\n\n${result.message}\nCommit: ${result.sha}\n\nVercel deployment was triggered by the GitHub commit.`);
    return;
  }
  if (session.action === "delete") {
    const result = await deleteCollectionFile(session.collection as CmsCollection, String(session.slug));
    await deleteSession(session.id);
    await sendMessage(session.chatId, `✅ Deleted and committed.\n\n${result.message}\nCommit: ${result.sha}`);
    return;
  }
  if (session.action === "media-delete") {
    const result = await deleteMediaFile(String(session.draft.path));
    await deleteSession(session.id);
    await sendMessage(session.chatId, `✅ Media deleted and committed.\n\nCommit: ${result.sha}`);
    return;
  }
  if (session.action === "media-upload") {
    const file = await downloadFile(String(session.draft.fileId));
    const media = prepareMedia(String(session.draft.filename), file.bytes, typeof session.draft.mime === "string" ? session.draft.mime : undefined);
    const result = await publishBinaryMedia(media.repositoryPath, file.bytes, `cms: upload media ${String(session.draft.filename)}`);
    await deleteSession(session.id);
    await sendMessage(session.chatId, `✅ Media committed.\n\nPath: ${media.publicPath}\nCommit: ${result.sha}\n\nVercel deployment was triggered by the GitHub commit.`);
    return;
  }
  if (session.action === "undo") {
    const recentCmsCommits = await getCmsHistory();
    if (!recentCmsCommits.some((commit) => commit.sha === String(session.draft.sha))) throw new Error("Undo is limited to recent CMS commits shown by /history.");
    const result = await revertRepositoryCommit(String(session.draft.sha), `cms: undo ${String(session.draft.sha).slice(0, 7)}`);
    await deleteSession(session.id);
    await sendMessage(session.chatId, `✅ Inverse commit created.\n\nCommit: ${result.sha || "unknown"}\nThe original history was preserved.`);
    return;
  }
  if (session.action === "toggle") {
    const collection = session.collection as CmsCollection;
    const slug = String(session.slug);
    const item = collectionItems(collection).find((candidate) => candidate.slug === slug);
    if (!item) throw new Error("Content entry no longer exists.");
    const current = collection === "projects" ? getProjectBySlug(slug, true) : collection === "writing" ? getWritingBySlug(slug, true) : getResearchBySlug(slug, true);
    const frontmatter = { ...(item as unknown as Record<string, unknown>), ...(session.draft.changes as Record<string, unknown>) };
    const result = await publishCollectionFile(collection, slug, frontmatter, current.content, "update");
    await deleteSession(session.id);
    await sendMessage(session.chatId, `✅ Publication state committed.\n\n${result.message}\nCommit: ${result.sha}\n\nVercel deployment was triggered by the GitHub commit.`);
    return;
  }
  const collection = session.collection as CmsCollection;
  const draft = { ...session.draft };
  const uploaded = draft.__uploadedMedia as {
    fileId?: string;
    filename?: string;
    mime?: string;
    repositoryPath?: string;
  } | undefined;

  delete draft.__uploadedMedia;

  if (uploaded) {
    if (!uploaded.fileId || !uploaded.filename || !uploaded.repositoryPath) {
      throw new Error("Uploaded image metadata is incomplete.");
    }

    const file = await downloadFile(uploaded.fileId);

    const media = prepareCollectionMedia(
      collection,
      String(
        draft.cover !== undefined
          ? draft.cover
          : draft.featuredImage !== undefined
            ? draft.featuredImage
            : uploaded.filename,
      ).split("/").pop() || uploaded.filename,
      file.bytes,
      uploaded.mime,
    );

    await publishBinaryMedia(
      media.repositoryPath,
      file.bytes,
      `cms: upload ${collection} cover ${uploaded.filename}`,
    );

    if (draft.cover !== undefined) {
      draft.cover = media.publicPath;
    }

    if (draft.featuredImage !== undefined) {
      draft.featuredImage = media.publicPath;
    }
  }

  const content = String(draft.content || "");
  delete draft.content;
  const nextSlug = String(draft.slug || session.slug);
  const result = session.slug && session.slug !== nextSlug
    ? await renameCollectionFile(collection, session.slug, nextSlug, draft, content)
    : await publishCollectionFile(collection, nextSlug, draft, content, session.slug ? "update" : "add");
  await deleteSession(session.id);
  await sendMessage(session.chatId, `✅ Changes committed.\n\n${result.message}\nCommit: ${result.sha}\n\nVercel deployment was triggered by the GitHub commit.`);
}

function portraitImageExtension(message: TelegramMessage): string {
  const mime = message.document?.mime_type || (message.photo ? "image/jpeg" : undefined);

  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/svg+xml") return "svg";

  return "jpg";
}

async function handlePortraitImageMessage(
  message: TelegramMessage,
  session: CmsSession,
): Promise<boolean> {
  if (session.action !== "portrait-upload" || session.step !== "portrait") {
    return false;
  }

  const fileId = message.photo?.at(-1)?.file_id || message.document?.file_id;

  if (!fileId) return false;

  try {
    const claimedSize =
      message.document?.file_size ?? message.photo?.at(-1)?.file_size;

    if (claimedSize && claimedSize > MAX_IMAGE_BYTES) {
      throw new Error("File exceeds the supported 8 MB size.");
    }

    const file = await downloadFile(fileId);
    const mime =
      message.document?.mime_type ||
      (message.photo ? "image/jpeg" : undefined);

    const filename = `portrait.${portraitImageExtension(message)}`;

    const media = prepareMedia(
      filename,
      file.bytes,
      mime,
    );

    session.draft.fileId = fileId;
    session.draft.filename = filename;
    session.draft.mime = mime || "image/jpeg";
    session.draft.publicPath = media.publicPath;
    session.step = "preview";

    await saveSession(session);

    await sendMessage(
      message.chat.id,
      `ARINZELAB PORTRAIT PREVIEW

OLD:
${session.draft.oldValue}

NEW:
${media.publicPath}

No changes have been published.`,
      { reply_markup: confirmKeyboard(session.id) },
    );
  } catch (error) {
    await sendMessage(
      message.chat.id,
      `❌ Portrait upload failed.

${error instanceof Error ? error.message : "Invalid image."}

Please send another image.`,
      { reply_markup: cancelKeyboard() },
    );
  }

  return true;
}

function collectionImageField(session: CmsSession): "cover" | "featuredImage" | null {
  const collection = session.collection as CmsCollection;
  const index = Number(session.step);
  const field = fieldSets[collection]?.[index];

  if (field?.key === "cover" || field?.key === "featuredImage") {
    return field.key;
  }

  if (session.action === "field-edit" && (session.draft.key === "cover" || session.draft.key === "featuredImage")) {
    return session.draft.key as "cover" | "featuredImage";
  }

  return null;
}

function collectionImageMime(message: TelegramMessage): string | undefined {
  return message.document?.mime_type || (message.photo ? "image/jpeg" : undefined);
}

function collectionImageExtension(message: TelegramMessage): string {
  const mime = collectionImageMime(message);

  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/svg+xml") return "svg";
  if (mime === "image/jpeg") return "jpg";

  const filename = message.document?.file_name || "";
  const match = filename.toLowerCase().match(/\.(png|jpe?g|webp|svg)$/);

  return match ? match[1] === "jpeg" ? "jpg" : match[1] : "jpg";
}

function collectionImageFilename(
  session: CmsSession,
  message: TelegramMessage,
): string {
  const field = collectionImageField(session);

  if (!field) {
    throw new Error("This message is not an image upload step.");
  }

  const base = String(session.draft.slug || session.slug || "cover")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "") || "cover";

  const extension = collectionImageExtension(message);

  return `${base}.${extension}`;
}

async function handleCollectionImageMessage(
  message: TelegramMessage,
  session: CmsSession,
): Promise<boolean> {
  const field = collectionImageField(session);

  if (!field) return false;

  const fileId = message.photo?.at(-1)?.file_id || message.document?.file_id;

  if (!fileId) return false;

  try {
    const claimedSize = message.document?.file_size ?? message.photo?.at(-1)?.file_size;

    if (claimedSize && claimedSize > MAX_IMAGE_BYTES) {
      throw new Error("File exceeds the supported 8 MB size.");
    }

    const file = await downloadFile(fileId);
    const filename = collectionImageFilename(session, message);
    const mime = collectionImageMime(message);

    const media = prepareCollectionMedia(
      session.collection as CmsCollection,
      filename,
      file.bytes,
      mime,
    );

    if (session.action === "field-edit") {
      session.draft.value = media.publicPath;
    } else {
      session.draft[field] = media.publicPath;
    }

    session.draft.__uploadedMedia = {
      fileId,
      filename,
      mime,
      repositoryPath: media.repositoryPath,
    };

    const index = Number(session.step);
    const next = index + 1;

    if (session.action === "field-edit") {
      session.step = "preview";
      await saveSession(session);
      await showCollectionPreview(session);
      return true;
    }

    if (next >= fieldSets[session.collection as CmsCollection].length) {
      session.step = "preview";
      await saveSession(session);
      await showCollectionPreview(session);
      return true;
    }

    session.step = String(next);
    await saveSession(session);
    await askCollectionField(
      message.chat.id,
      session.id,
      session.collection as CmsCollection,
      next,
      false,
    );

    return true;
  } catch (error) {
    await sendMessage(
      message.chat.id,
      `Image upload failed: ${error instanceof Error ? error.message : "Invalid image."}\n\nPlease send another image.`,
      { reply_markup: cancelKeyboard() },
    );

    return true;
  }
}

async function handleSessionMessage(message: TelegramMessage, session: CmsSession) {
  const text = message.text?.trim() || "";
  if (text === "/cancel") { await deleteSession(session.id); await sendMessage(message.chat.id, "Operation cancelled. No GitHub changes were made."); return; }
  if (session.action === "site-edit") {
    const value = boundedText(text, 1_000);
    if (!value) { await sendMessage(message.chat.id, "Value is empty or too long. Send a shorter value or /cancel."); return; }
    session.draft.value = value;
    session.step = "preview";
    await saveSession(session);
    await sendMessage(message.chat.id, `ARINZELAB CHANGE PREVIEW\n\n${session.draft.path}\n\nOLD:\n${session.draft.oldValue}\n\nNEW:\n${value}\n\nNo changes have been published.`, { reply_markup: confirmKeyboard(session.id) });
    return;
  }
  if (session.action === "media-upload") {
    const filename = boundedText(text, 120);
    if (!filename) { await sendMessage(message.chat.id, "Send a safe filename such as portrait.webp, or /cancel."); return; }
    session.draft.filename = filename;
    session.step = "media";
    await saveSession(session);
    await sendMessage(message.chat.id, "Now send the image as a Telegram photo or document.", { reply_markup: cancelKeyboard() });
    return;
  }
  if (session.action === "undo") { await sendMessage(message.chat.id, "Use the confirmation button to create the inverse commit, or /cancel."); return; }
  if (session.step === "preview") { await sendMessage(message.chat.id, "This draft is awaiting confirmation. Use Publish, Edit, or Cancel."); return; }
  const collection = session.collection as CmsCollection;
  if (session.action === "field-edit") {
    const key = String(session.draft.key);
    if (text === "/skip") {
      await deleteSession(session.id);
      await sendMessage(message.chat.id, "Field edit cancelled. No GitHub changes were made.");
      return;
    }
    try {
      session.draft.value = parseField(key, text);
      session.step = "preview";
      await saveSession(session);
      await sendMessage(message.chat.id, `ARINZELAB CHANGE PREVIEW\n\n${collection.slice(0, -1)} / ${session.slug}\n\n${key}\n\nOLD:\n${fieldValueLabel(session.draft.oldValue)}\n\nNEW:\n${fieldValueLabel(session.draft.value)}\n\nNo changes have been published.`, { reply_markup: confirmKeyboard(session.id) });
    } catch (error) {
      await sendMessage(message.chat.id, `❌ ${error instanceof Error ? error.message : "Invalid value."}`);
    }
    return;
  }
  const index = Number(session.step);
  const field = fieldSets[collection][index];
  if (!field) { await sendMessage(message.chat.id, "This session has expired. Start the command again."); await deleteSession(session.id); return; }
  if (text.toLowerCase() === "/skip") {
    const optional = field.optional || (field.key === "content" && Boolean(session.slug));
    if (!optional) { await sendMessage(message.chat.id, "This field is required."); return; }
    // Keep existing long-form content when editing; /skip means no change.
    if (!(field.key === "content" && session.slug)) session.draft[field.key] = undefined;
  } else {
    try { session.draft[field.key] = parseField(field.key, text); }
    catch (error) { await sendMessage(message.chat.id, `❌ ${error instanceof Error ? error.message : "Invalid value."}`); return; }
  }
  const next = index + 1;
  if (next >= fieldSets[collection].length) {
    session.step = "preview";
    await saveSession(session);
    await showCollectionPreview(session);
    return;
  }
  session.step = String(next);
  await saveSession(session);
  await askCollectionField(message.chat.id, session.id, collection, next, Boolean(session.slug));
}

async function handleMediaMessage(message: TelegramMessage, session: CmsSession) {
  if (session.action !== "media-upload" || session.step !== "media") return false;
  const fileId = message.photo?.at(-1)?.file_id || message.document?.file_id;
  if (!fileId) return false;
  try {
    const claimedSize = message.document?.file_size ?? message.photo?.at(-1)?.file_size;
    if (claimedSize && claimedSize > MAX_IMAGE_BYTES) throw new Error("File exceeds the supported 8 MB size.");
    const file = await downloadFile(fileId);
    prepareMedia(String(session.draft.filename), file.bytes, message.document?.mime_type);
    session.draft.fileId = fileId;
    session.draft.mime = message.document?.mime_type || "image/jpeg";
    session.step = "preview";
    await saveSession(session);
    await sendMessage(message.chat.id, `ARINZELAB MEDIA PREVIEW\n\nFilename: ${session.draft.filename}\nSize: ${file.bytes.length} bytes\n\nNo changes have been published.`, { reply_markup: confirmKeyboard(session.id) });
  } catch (error) { await sendMessage(message.chat.id, `❌ Image rejected.\n\n${error instanceof Error ? error.message : "Unsupported image."}`); }
  return true;
}

async function handleCallback(query: TelegramCallbackQuery) {
  const chatId = query.message?.chat.id;
  if (!chatId) return;
  await answerCallbackQuery(query.id);
  const data = query.data || "";
  if (data === "help") { await sendMessage(chatId, helpText()); return; }
  if (data === "cmd:cancel") { const active = await getActiveSession(query.from.id, chatId); if (active) await deleteSession(active.id); await sendMessage(chatId, "Operation cancelled. No GitHub changes were made."); return; }
  if (data.startsWith("cmd:")) { await routeCommand({ chat: { id: chatId, type: "private" }, from: query.from, text: `/${data.slice(4)}` } as TelegramMessage); return; }
  if (data.startsWith("collection:list:")) { const collection = data.split(":")[2] as CmsCollection; if (collections.has(collection)) await sendMessage(chatId, listCollection(collection), { reply_markup: collectionKeyboard(collection) }); return; }
  if (data.startsWith("collection:add:")) { const collection = data.split(":")[2] as CmsCollection; if (collections.has(collection)) await beginCollection(chatId, query.from.id, collection); return; }
  if (data.startsWith("editfield:")) {
    const [, menuId, key] = data.split(":");
    const menu = await readSession(menuId);
    if (!menu || menu.action !== "edit-menu" || menu.userId !== query.from.id || !menu.collection || !menu.slug) { await sendMessage(chatId, "This edit menu has expired."); return; }
    await deleteSession(menuId);
    await beginFieldEdit(chatId, query.from.id, menu.collection, menu.slug, key);
    return;
  }
  if (data.startsWith("deleteitem:")) {
    const menuId = data.slice("deleteitem:".length);
    const menu = await readSession(menuId);
    if (!menu || menu.action !== "edit-menu" || menu.userId !== query.from.id || !menu.collection || !menu.slug) { await sendMessage(chatId, "This edit menu has expired."); return; }
    await deleteSession(menuId);
    const id = await createSession(query.from.id, chatId, "delete", {});
    const session = await readSession(id);
    if (session) {
      session.collection = menu.collection;
      session.slug = menu.slug;
      session.step = "preview";
      await saveSession(session);
    }
    await sendMessage(chatId, `⚠️ Delete ${menu.collection.slice(0, -1)} ${menu.slug}? This creates a destructive GitHub commit.`, { reply_markup: { inline_keyboard: [[sessionButton(id, "Delete", "publish")], [{ text: "Cancel", callback_data: "cmd:cancel" }]] } });
    return;
  }
  if (data.startsWith("site:edit:")) { await beginSiteEdit(chatId, query.from.id, data.slice("site:edit:".length)); return; }
  if (data.startsWith("site-select:")) {
    const [, kind, slug] = data.split(":");
    const normalizedKind = kind === "p" ? "project" : kind === "w" ? "writing" : kind === "r" ? "research" : "";
    if ((normalizedKind === "project" || normalizedKind === "writing" || normalizedKind === "research") && validateSlug(slug).ok) await beginSiteSelection(chatId, query.from.id, normalizedKind, slug);
    return;
  }
  if (data.startsWith("history:revert:")) { const sha = data.slice("history:revert:".length); const id = await createSession(query.from.id, chatId, "undo", { sha }); const session = await readSession(id); if (session) { session.step = "preview"; await saveSession(session); await sendMessage(chatId, `Create an inverse commit for ${sha.slice(0, 12)}?`, { reply_markup: { inline_keyboard: [[sessionButton(id, "Undo", "publish")], [{ text: "Cancel", callback_data: "cmd:cancel" }]] } }); } return; }
  if (data.startsWith("session:")) {
    const [, id, action] = data.split(":");
    const session = await readSession(id);
    if (!session || session.userId !== query.from.id || session.chatId !== chatId) { await sendMessage(chatId, "This draft has expired. No changes were published."); return; }
    if (action === "cancel") { await deleteSession(id); await sendMessage(chatId, "Operation cancelled. No GitHub changes were made."); return; }
    if (action === "edit") {
      if (session.action === "field-edit" && session.collection && session.slug) {
        await beginFieldEdit(chatId, query.from.id, session.collection, session.slug, String(session.draft.key));
      } else {
        session.step = "0";
        await saveSession(session);
        if (session.collection) await askCollectionField(chatId, id, session.collection, 0, true);
        else await sendMessage(chatId, "Send the updated value.");
      }
      return;
    }
    if (action === "publish") {
      try {
        await publishSession(session);
      } catch (error) {
        const operationId = genericOperationId();
        console.error(`[${operationId}] Telegram publish failure`, error instanceof Error ? error.message : "unknown error");
        await sendMessage(chatId, `❌ Something went wrong.\n\nNo changes were published.\nOperation ID: ${operationId}`);
      }
    }
  }
}

function helpText() {
  return `ARINZELAB CMS\n\n/start or /admin — dashboard\n/home — edit homepage copy\n/about — edit About copy\n/now — edit Now copy\n/navigation — edit navigation\n/projects — list projects\n/writing — list articles\n/research — list research\n/addproject — create project\n/editproject <slug> — edit one project field\n/deleteproject <slug> — delete project\n/publishproject <slug> — publish project\n/unpublishproject <slug> — unpublish project\n/featureproject <slug> — feature project\n/unfeatureproject <slug> — unfeature project\n/addarticle — create article\n/editarticle <slug> — edit one article field\n/deletearticle <slug> — delete article\n/publisharticle <slug> — publish article\n/unpublisharticle <slug> — unpublish article\n/addresearch — create research\n/editresearch <slug> — edit one research field\n/deleteresearch <slug> — delete research\n/publishresearch <slug> — publish research\n/unpublishresearch <slug> — unpublish research\n/media — list, upload, replace, or delete media\n/settings and /seo — edit site metadata\n/history — recent CMS commits\n/backup — current Git snapshot\n/undo <sha> — inverse commit\n/cancel — cancel the current draft\n\nEvery content change is validated, previewed, and explicitly confirmed before a GitHub commit.`;
}

async function routeCommand(message: TelegramMessage) {
  const text = message.text || "";
  const command = text.match(/^\/([^\s@]+)/)?.[1].toLowerCase() || "";
  const args = commandArguments(text);
  const { chatId, userId } = messageContext(message);
  if (!userId) return;
  if (command === "start" || command === "admin") { await sendMessage(chatId, "ARINZELAB ADMIN\n\nSelect an area. All publishing requires preview and confirmation.", { reply_markup: adminKeyboard }); return; }
  if (command === "help") { await sendMessage(chatId, helpText()); return; }
  if (command === "cancel") { const active = await getActiveSession(userId, chatId); if (active) await deleteSession(active.id); await sendMessage(chatId, "Operation cancelled. No GitHub changes were made."); return; }
  if (command === "about-portrait") {
  await beginPortraitUpload(chatId, userId);
  return;
}

  if (["home", "about", "now", "settings", "seo"].includes(command)) {
    const site = getSiteContent();
    const paths = command === "home" ? [["Hero title", "homepage.hero.title"], ["Hero description", "homepage.hero.description"], ["Direction", "homepage.currentDirection.body"], ["Focus item 1", "homepage.focusAreas.0.label"], ["Selected project 1", "homepage.selectedProjects.0.slug"], ["Technical heading", "homepage.technicalFocus.heading"], ["Writing heading", "homepage.writing.heading"], ["Research heading", "homepage.research.heading"], ["Working now", "homepage.workingNow.body"], ["Opportunities heading", "homepage.opportunities.heading"], ["CTA description", "homepage.opportunities.description"]] : command === "about" ? [["About title", "about.title"], ["Intro", "about.intro.0"], ["Build heading", "about.whatIBuild.heading"], ["Principle 1", "about.howIWork.principles.0.text"], ["Current direction", "about.currentDirection.body"]] : command === "now" ? [["Now title", "now.title"], ["Description", "now.description"], ["Building items", "now.sections.0.items"], ["Learning items", "now.sections.1.items"], ["Exploring items", "now.sections.2.items"], ["Updated date", "now.updatedAt"]] : command === "seo" ? [["Global SEO title", "seo.title"], ["Global SEO description", "seo.description"], ["Canonical URL", "seo.canonicalUrl"], ["About SEO title", "pageSeo.about.title"], ["About SEO description", "pageSeo.about.description"], ["Contact SEO title", "pageSeo.contact.title"], ["Contact SEO description", "pageSeo.contact.description"]] : [["Site name", "name"], ["Email", "email"], ["Description", "description"], ["Availability", "availabilityText"], ...site.socials.map((social, index) => [`${social.label} URL`, `socials.${index}.href`] as [string, string])];
    const selectionButtons = command === "home" ? [
      ...getAllProjects().slice(0, 8).map((item) => [{ text: `+ project: ${item.title}`.slice(0, 60), callback_data: `site-select:p:${item.slug}` }]),
      ...getAllWriting().slice(0, 8).map((item) => [{ text: `+ writing: ${item.title}`.slice(0, 60), callback_data: `site-select:w:${item.slug}` }]),
      ...getAllResearch().slice(0, 8).map((item) => [{ text: `+ research: ${item.title}`.slice(0, 60), callback_data: `site-select:r:${item.slug}` }]),
    ] : [];
    await sendMessage(chatId, `${command.toUpperCase()}\n\nChoose a field to edit.`, { reply_markup: { inline_keyboard: paths.map(([label, path]) => [{ text: label, callback_data: `site:edit:${path}` }]).concat(
  command === "about"
    ? [[
        {
          text: "Portrait image",
          callback_data: "cmd:about-portrait",
        },
      ]]
    : [],
)
.concat(selectionButtons).concat([[{ text: "Cancel", callback_data: "cmd:cancel" }]]) } }); return;
  }
  if (command === "navigation") {
    const site = getSiteContent();
    const paths = site.navigation.map((item, index) => [`${item.label} label`, `navigation.${index}.label`] as [string, string]).concat(site.navigation.map((item, index) => [`${item.label} URL`, `navigation.${index}.href`] as [string, string]));
    await sendMessage(chatId, "NAVIGATION\n\nChoose a field to edit.", { reply_markup: { inline_keyboard: paths.map(([label, path]) => [{ text: label, callback_data: `site:edit:${path}` }]).concat([[{ text: "Cancel", callback_data: "cmd:cancel" }]]) } }); return;
  }
  if (["projects", "writing", "research"].includes(command)) { const collection = command as CmsCollection; await sendMessage(chatId, listCollection(collection), { reply_markup: collectionKeyboard(collection) }); return; }
  if (["addproject", "addarticle", "addresearch"].includes(command)) { await beginCollection(chatId, userId, command === "addproject" ? "projects" : command === "addarticle" ? "writing" : "research"); return; }
  if (["editproject", "editarticle", "editresearch"].includes(command)) { const collection = command === "editproject" ? "projects" : command === "editarticle" ? "writing" : "research"; if (!validateSlug(args).ok) { await sendMessage(chatId, `Usage: /${command} slug`); return; } await sendEditMenu(chatId, userId, collection, args); return; }
  if (["deleteproject", "deletearticle", "deleteresearch"].includes(command)) { const collection = command === "deleteproject" ? "projects" : command === "deletearticle" ? "writing" : "research"; if (!validateSlug(args).ok) { await sendMessage(chatId, `Usage: /${command} slug`); return; } const item = collectionItems(collection).find((candidate) => candidate.slug === args); if (!item) { await sendMessage(chatId, "No entry found for that slug."); return; } const id = await createSession(userId, chatId, "delete", {}); const session = await readSession(id); if (session) { session.collection = collection; session.slug = args; session.step = "preview"; await saveSession(session); await sendMessage(chatId, `⚠️ Delete ${item.title}? This cannot be undone automatically.`, { reply_markup: { inline_keyboard: [[sessionButton(id, "Delete", "publish")], [{ text: "Cancel", callback_data: "cmd:cancel" }]] } }); } return; }
  if (["publishproject", "unpublishproject", "featureproject", "unfeatureproject", "publisharticle", "unpublisharticle", "publishresearch", "unpublishresearch"].includes(command)) {
    const collection: CmsCollection = command.includes("project") ? "projects" : command.includes("article") ? "writing" : "research";
    if (!validateSlug(args).ok) { await sendMessage(chatId, `Usage: /${command} slug`); return; }
    const item = collectionItems(collection).find((candidate) => candidate.slug === args);
    if (!item) { await sendMessage(chatId, "No entry found for that slug."); return; }
    const changes: Record<string, unknown> = command.startsWith("unpublish") ? { published: false } : command.startsWith("publish") ? { published: true } : { featured: command === "featureproject" };
    const id = await createSession(userId, chatId, "toggle", { changes });
    const session = await readSession(id);
    if (session) { session.collection = collection; session.slug = args; session.step = "preview"; await saveSession(session); }
    await sendMessage(chatId, `ARINZELAB CHANGE PREVIEW\n\n${item.title}\n\n${Object.entries(changes).map(([key, value]) => `${key}: ${value}`).join("\n")}\n\nNo changes have been published.`, { reply_markup: { inline_keyboard: [[sessionButton(id, "Publish", "publish")], [{ text: "Cancel", callback_data: "cmd:cancel" }]] } });
    return;
  }
  if (command === "media-upload") { await createSession(userId, chatId, "media-upload", {}); await sendMessage(chatId, "Media upload\n\nSend a safe filename first, such as portrait.webp.", { reply_markup: cancelKeyboard() }); return; }
  if (command === "media-delete") {
    const filename = args.toLowerCase().replace(/[^a-z0-9._-]/g, "-");
    if (!/^[a-z0-9][a-z0-9._-]*\.(png|jpe?g|webp|svg)$/.test(filename) || filename.includes("..")) { await sendMessage(chatId, "Usage: /media-delete filename.png"); return; }
    const repositoryPath = `public/images/cms/${filename}`;
    const references = findLocalMediaReferences(`/images/cms/${filename}`);
    const id = await createSession(userId, chatId, "media-delete", { path: repositoryPath, references });
    const session = await readSession(id);
    if (session) { session.step = "preview"; await saveSession(session); }
    await sendMessage(chatId, `${references.length ? `⚠️ This image is referenced by:\n- ${references.join("\n- ")}\n\n` : ""}Delete /images/cms/${filename}?`, { reply_markup: { inline_keyboard: [[sessionButton(id, "Delete", "publish")], [{ text: "Cancel", callback_data: "cmd:cancel" }]] } });
    return;
  }
  if (command === "media") { if (["upload", "replace"].includes(args)) { await createSession(userId, chatId, "media-upload", {}); await sendMessage(chatId, `Media ${args}\n\nSend a safe filename first, such as portrait.webp.`, { reply_markup: cancelKeyboard() }); return; } if (args.startsWith("delete ")) { await routeCommand({ ...message, text: `/media-delete ${args.slice(7).trim()}` }); return; } const media = listLocalMedia(); await sendMessage(chatId, `MEDIA\n\n${media.length ? media.join("\n") : "No local media found."}\n\nUse /media upload, /media replace, or /media delete <filename>.`, { reply_markup: { inline_keyboard: [[{ text: "Upload", callback_data: "cmd:media-upload" }], [{ text: "Cancel", callback_data: "cmd:cancel" }]] } }); return; }
  if (command === "history") { const history = await getCmsHistory(); if (!history.length) { await sendMessage(chatId, "No CMS commits found."); return; } await sendMessage(chatId, `RECENT CHANGES\n\n${history.slice(0, 10).map((commit, index) => `${index + 1}. ${commit.commit.message}\n   ${commit.sha.slice(0, 12)} · ${commit.commit.author?.date || "unknown date"}`).join("\n\n")}`, { reply_markup: { inline_keyboard: history.slice(0, 5).map((commit) => [{ text: `Undo ${commit.sha.slice(0, 7)}`, callback_data: `history:revert:${commit.sha}` }]) } }); return; }
  if (command === "backup") { const backup = await createBackupSnapshot(); await sendMessage(chatId, `Backup snapshot identified.\n\nBranch: ${backup.branch}\nCommit: ${backup.commit}\nCreated: ${backup.createdAt}\nProjects: ${backup.content.projects}\nWriting: ${backup.content.writing}\nResearch: ${backup.content.research}\nMedia: ${backup.mediaReferences}\n\nGitHub history remains the durable source of truth.`); return; }
  if (command === "undo") { if (!/^[a-f0-9]{7,64}$/i.test(args)) { await sendMessage(chatId, "Usage: /undo <commit SHA>"); return; } const id = await createSession(userId, chatId, "undo", { sha: args }); const session = await readSession(id); if (session) { session.step = "preview"; await saveSession(session); await sendMessage(chatId, `Create an inverse commit for ${args}?`, { reply_markup: { inline_keyboard: [[sessionButton(id, "Undo", "publish")], [{ text: "Cancel", callback_data: "cmd:cancel" }]] } }); } return; }
  if (command === "preview" || command === "publish") { await sendMessage(chatId, "No active draft is awaiting confirmation."); return; }
  await sendMessage(chatId, "Unknown command. Use /help for available CMS commands.");
}

export async function handleTelegramUpdate(update: TelegramUpdate) {
  if (update.callback_query) return handleCallback(update.callback_query);
  const message = update.message;
  if (!message) return;
  const { userId, chatId } = messageContext(message);
  if (!userId) return;
  const existingSessionId = message.text?.match(/^\/cancel\s+([a-f0-9]{20})$/)?.[1];
  if (existingSessionId) { await deleteSession(existingSessionId); await sendMessage(chatId, "Operation cancelled. No GitHub changes were made."); return; }
  const possibleSessions = message.text?.match(/^\/session\s+([a-f0-9]{20})$/)?.[1];
  if (possibleSessions) { await sendMessage(chatId, "Use the inline controls attached to the draft."); return; }
  // The session ID is carried by the inline keyboard, so text updates are found
  // through the short-lived in-memory/Redis index for this chat.
  const session = await getActiveSession(userId, chatId);
  if (session) {
  if (message.photo || message.document) {
    if (await handlePortraitImageMessage(message, session)) {
      return;
    }

    if (await handleCollectionImageMessage(message, session)) {
        return;
      }

      if (session.action === "media-upload") {
        await handleMediaMessage(message, session);
        return;
      }
    }
    if (message.document && (session.action === "content" || session.action === "field-edit") && (session.action === "field-edit" ? session.draft.key === "content" : fieldSets[session.collection as CmsCollection][Number(session.step)]?.key === "content")) {
      try {
        if (!message.document.file_name || !/\.(md|mdx)$/i.test(message.document.file_name)) throw new Error("Only .md and .mdx files are supported for long-form content.");
        const file = await downloadFile(message.document.file_id);
        const content = file.bytes.toString("utf8");
        const validation = validateMarkdown(content);
        if (!validation.ok) throw new Error(validation.errors.join(" "));
        if (session.action === "field-edit") session.draft.value = content;
        else session.draft.content = content;
        session.step = "preview";
        await saveSession(session);
        if (session.action === "field-edit") {
          await sendMessage(chatId, `ARINZELAB CHANGE PREVIEW\n\n${session.collection?.slice(0, -1)} / ${session.slug}\n\ncontent\n\nOLD:\n${truncateTelegram(String(session.draft.oldValue), 1_000)}\n\nNEW:\n${truncateTelegram(content, 1_000)}\n\nNo changes have been published.`, { reply_markup: confirmKeyboard(session.id) });
        } else {
          await showCollectionPreview(session);
        }
      } catch (error) { await sendMessage(chatId, `❌ Markdown file rejected.\n\n${error instanceof Error ? error.message : "Invalid document."}`); }
      return;
    }
    await handleSessionMessage(message, session);
    return;
  }
  if (message.text?.startsWith("/")) return routeCommand(message);
  return;
}

export { routeCommand, handleSessionMessage, handleMediaMessage };
