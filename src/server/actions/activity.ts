"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Octokit } from "octokit";

export interface CommitData {
  sha: string;
  message: string;
  author: string;
  authorAvatar: string;
  authorUrl: string;
  date: string;
  url: string;
  repoName: string;
}

export interface RepoBrief {
  name: string;
  url: string;
  defaultBranch: string;
  lastCommit: CommitData | null;
  openIssues: number;
  language: string | null;
}

export interface ActivityData {
  recentCommits: CommitData[];
  repos: RepoBrief[];
}

export async function getProjectActivity(projectId: string): Promise<ActivityData> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const repos = await db.linkedRepo.findMany({ where: { projectId } });
  if (repos.length === 0) return { recentCommits: [], repos: [] };

  const account = await db.account.findFirst({
    where: { userId: session.user.id, provider: "github" },
    select: { access_token: true },
  });

  const token = account?.access_token ?? process.env.GITHUB_TOKEN;
  if (!token) return { recentCommits: [], repos: [] };

  const octokit = new Octokit({ auth: token });

  const repoBriefs: RepoBrief[] = [];
  const allCommits: CommitData[] = [];

  for (const repo of repos) {
    const [owner, repoName] = repo.githubRepoName.split("/");

    try {
      const [commitsRes, repoRes] = await Promise.allSettled([
        octokit.request("GET /repos/{owner}/{repo}/commits", {
          owner, repo: repoName, per_page: 5,
        }),
        octokit.request("GET /repos/{owner}/{repo}", {
          owner, repo: repoName,
        }),
      ]);

      let lastCommit: CommitData | null = null;
      if (commitsRes.status === "fulfilled") {
        const commits = commitsRes.value.data;
        if (commits.length > 0) {
          const first = commits[0] as any;
          lastCommit = {
            sha: first.sha,
            message: first.commit?.message ?? "",
            author: first.commit?.author?.name ?? first.author?.login ?? "unknown",
            authorAvatar: first.author?.avatar_url ?? "",
            authorUrl: first.author?.html_url ?? "",
            date: first.commit?.author?.date ?? "",
            url: first.html_url ?? "",
            repoName: repo.githubRepoName,
          };
        }

        for (const c of commits.slice(0, 5)) {
          const data = c as any;
          allCommits.push({
            sha: data.sha,
            message: data.commit?.message ?? "",
            author: data.commit?.author?.name ?? data.author?.login ?? "unknown",
            authorAvatar: data.author?.avatar_url ?? "",
            authorUrl: data.author?.html_url ?? "",
            date: data.commit?.author?.date ?? "",
            url: data.html_url ?? "",
            repoName: repo.githubRepoName,
          });
        }
      }

      const repoData = repoRes.status === "fulfilled" ? repoRes.value.data as any : null;

      repoBriefs.push({
        name: repo.githubRepoName,
        url: repo.githubRepoUrl,
        defaultBranch: repo.defaultBranch,
        lastCommit,
        openIssues: repoData?.open_issues_count ?? 0,
        language: repoData?.language ?? null,
      });
    } catch {
      repoBriefs.push({
        name: repo.githubRepoName,
        url: repo.githubRepoUrl,
        defaultBranch: repo.defaultBranch,
        lastCommit: null,
        openIssues: 0,
        language: null,
      });
    }
  }

  allCommits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return { recentCommits: allCommits.slice(0, 20), repos: repoBriefs };
}
