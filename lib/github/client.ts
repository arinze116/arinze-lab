import "server-only";

const API_ROOT = "https://api.github.com";
export interface GithubContent { path: string; sha: string; content: string; html_url?: string }
export interface GithubCommit { sha: string; html_url?: string; commit: { message: string; author?: { date?: string } } }

function githubConfig() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is not configured.");
  return { token, owner: process.env.GITHUB_OWNER || "arinze116", repo: process.env.GITHUB_REPO || "arinze-lab", branch: process.env.GITHUB_BRANCH || "main" };
}

async function githubRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { token } = githubConfig();
  const response = await fetch(`${API_ROOT}${path}`, { ...init, headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28", ...(init.body ? { "Content-Type": "application/json" } : {}), ...init.headers }, cache: "no-store" });
  if (!response.ok) { const id = response.headers.get("x-github-request-id") || "unknown"; throw new Error(`GitHub ${response.status} (${id}): ${(await response.text().catch(() => "")).slice(0, 300)}`); }
  return response.json() as Promise<T>;
}

export function repositoryPath(filePath: string): string {
  const { owner, repo } = githubConfig();
  return `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${filePath.split("/").map(encodeURIComponent).join("/")}`;
}

export async function getRepositoryFile(filePath: string, ref?: string): Promise<GithubContent | null> {
  try { const data = await githubRequest<GithubContent>(`${repositoryPath(filePath)}?ref=${encodeURIComponent(ref || githubConfig().branch)}`); return { ...data, content: Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf8") }; }
  catch (error) { if (error instanceof Error && error.message.startsWith("GitHub 404")) return null; throw error; }
}

export async function putRepositoryFile(filePath: string, content: string | Buffer, message: string, sha?: string) {
  const { branch } = githubConfig();
  return githubRequest<{ content?: { sha?: string; html_url?: string }; commit?: GithubCommit }>(repositoryPath(filePath), { method: "PUT", body: JSON.stringify({ message, content: Buffer.isBuffer(content) ? content.toString("base64") : Buffer.from(content, "utf8").toString("base64"), branch, ...(sha ? { sha } : {}) }) });
}

export async function deleteRepositoryFile(filePath: string, message: string, sha: string) {
  const { branch } = githubConfig();
  return githubRequest<{ commit?: GithubCommit }>(repositoryPath(filePath), { method: "DELETE", body: JSON.stringify({ message, sha, branch }) });
}

export async function listRepositoryCommits(perPage = 20): Promise<GithubCommit[]> {
  const { owner, repo, branch } = githubConfig();
  return githubRequest<GithubCommit[]>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?sha=${encodeURIComponent(branch)}&per_page=${Math.min(perPage, 100)}`);
}

export async function getRepositoryCommit(sha: string): Promise<{ sha: string; parents: Array<{ sha: string }>; files?: Array<{ filename: string; status: string }> }> {
  const { owner, repo } = githubConfig();
  return githubRequest(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits/${encodeURIComponent(sha)}`);
}

export async function revertRepositoryCommit(sha: string, message: string) {
  const { owner, repo } = githubConfig();
  return githubRequest<{ sha?: string; html_url?: string }>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits/${encodeURIComponent(sha)}/revert`, { method: "POST", body: JSON.stringify({ message }) });
}

export function githubBranch(): string { return githubConfig().branch; }
