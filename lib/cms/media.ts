import "server-only";

import fs from "fs";
import path from "path";

import {
  safeMediaPath,
  safeCollectionMediaPath,
  validateMediaBytes,
} from "@/lib/cms/validation";

const PUBLIC_DIR = path.join(process.cwd(), "public");

export function listLocalMedia(): string[] {
  const root = path.join(PUBLIC_DIR, "images");

  if (!fs.existsSync(root)) return [];

  const files: string[] = [];

  function visit(directory: string, prefix: string) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const full = path.join(directory, entry.name);
      const relative = `${prefix}/${entry.name}`;

      if (entry.isDirectory()) {
        visit(full, relative);
      } else if (/\.(png|jpe?g|webp|svg)$/i.test(entry.name)) {
        files.push(`/images${relative}`);
      }
    }
  }

  visit(root, "");

  return files.sort();
}

export function prepareMedia(
  filename: string,
  bytes: Buffer,
  mime?: string,
) {
  const validation = validateMediaBytes(bytes, mime);

  if (!validation.ok) {
    throw new Error(validation.errors.join(" "));
  }

  const repositoryPath = safeMediaPath(filename);

  return {
    repositoryPath,
    publicPath: `/${repositoryPath.replace(/^public\//, "")}`,
  };
}

export function prepareCollectionMedia(
  collection: "projects" | "writing" | "research",
  filename: string,
  bytes: Buffer,
  mime?: string,
) {
  const validation = validateMediaBytes(bytes, mime);

  if (!validation.ok) {
    throw new Error(validation.errors.join(" "));
  }

  const repositoryPath = safeCollectionMediaPath(collection, filename);

  return {
    repositoryPath,
    publicPath: `/${repositoryPath.replace(/^public\//, "")}`,
  };
}

export function findLocalMediaReferences(mediaPath: string): string[] {
  const references: string[] = [];

  const roots = [
    path.join(process.cwd(), "content"),
    path.join(process.cwd(), "app"),
    path.join(process.cwd(), "components"),
    path.join(process.cwd(), "lib"),
  ];

  const needle = mediaPath.replace(/^public/, "");

  function visit(directory: string) {
    if (!fs.existsSync(directory)) return;

    for (const entry of fs.readdirSync(directory, {
      withFileTypes: true,
    })) {
      const full = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        visit(full);
      } else if (/\.(mdx|json|ts|tsx|css)$/i.test(entry.name)) {
        if (fs.readFileSync(full, "utf8").includes(needle)) {
          references.push(path.relative(process.cwd(), full));
        }
      }
    }
  }

  roots.forEach(visit);

  return references;
}