import "server-only";
import { githubBranch, getRepositoryCommit, listRepositoryCommits } from "@/lib/github/client";
import { getAllProjects, getAllResearch, getAllWriting } from "@/lib/content";
import { listLocalMedia } from "@/lib/cms/media";
import { getSiteContent } from "@/lib/site-content";

export async function getCmsHistory() {
  const commits = await listRepositoryCommits(50);
  return commits.filter((commit) => commit.commit.message.toLowerCase().startsWith("cms:"));
}

export async function createBackupSnapshot() {
  const commits = await listRepositoryCommits(1);
  const current = commits[0];
  return {
    commit: current?.sha || "unknown",
    branch: githubBranch(),
    createdAt: new Date().toISOString(),
    content: { projects: getAllProjects(true).length, writing: getAllWriting(true).length, research: getAllResearch(true).length },
    mediaReferences: listLocalMedia().length,
    configVersion: getSiteContent().version,
    note: "GitHub commit history is the durable content backup.",
  };
}

export async function getUndoTarget(sha: string) {
  const commit = await getRepositoryCommit(sha);
  if (!commit.parents[0]) throw new Error("The selected commit has no parent and cannot be undone safely.");
  return commit.parents[0].sha;
}
