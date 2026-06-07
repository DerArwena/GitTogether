"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Octokit } from "octokit";

export interface Contributor {
  login: string;
  avatarUrl: string;
  htmlUrl: string;
  commits: number;
  additions: number;
  deletions: number;
}

export interface RepoContributors {
  repoName: string;
  repoUrl: string;
  contributors: Contributor[];
}

export async function getContributors(projectId: string): Promise<RepoContributors[]> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const repos = await db.linkedRepo.findMany({ where: { projectId } });
  if (repos.length === 0) return [];

  const account = await db.account.findFirst({
    where: { userId: session.user.id, provider: "github" },
    select: { access_token: true },
  });

  const token = account?.access_token ?? process.env.GITHUB_TOKEN;
  if (!token) return [];

  const octokit = new Octokit({ auth: token });

  const results: RepoContributors[] = [];

  for (const repo of repos) {
    const [owner, repoName] = repo.githubRepoName.split("/");

    try {
      const { data } = await octokit.request("GET /repos/{owner}/{repo}/stats/contributors", {
        owner,
        repo: repoName,
      });

      if (!data || !Array.isArray(data)) continue;

      const contributors: Contributor[] = data
        .filter((c: any) => c.author)
        .map((c: any) => ({
          login: c.author.login,
          avatarUrl: c.author.avatar_url,
          htmlUrl: c.author.html_url,
          commits: c.total,
          additions: c.weeks?.reduce((sum: number, w: any) => sum + (w.a ?? 0), 0) ?? 0,
          deletions: c.weeks?.reduce((sum: number, w: any) => sum + (w.d ?? 0), 0) ?? 0,
        }))
        .sort((a: Contributor, b: Contributor) => b.commits - a.commits);

      results.push({ repoName: repo.githubRepoName, repoUrl: repo.githubRepoUrl, contributors });
    } catch {
      // skip repos that fail (no access, private without scope, etc.)
    }
  }

  return results;
}
