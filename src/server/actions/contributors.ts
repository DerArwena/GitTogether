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

    let contributors: Contributor[] = [];

    try {
      const statsRes = await octokit.request("GET /repos/{owner}/{repo}/stats/contributors", {
        owner,
        repo: repoName,
      });

      const statsData = statsRes.data;
      if (statsData && Array.isArray(statsData) && statsData.length > 0) {
        contributors = statsData
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
      }
    } catch {
      // stats/contributors may return 202 (not ready) — fall through to fallback
    }

    if (contributors.length === 0) {
      try {
        const { data } = await octokit.request("GET /repos/{owner}/{repo}/contributors", {
          owner,
          repo: repoName,
          per_page: 10,
        });

        if (data && Array.isArray(data)) {
          contributors = data
            .filter((c: any) => c.login)
            .map((c: any) => ({
              login: c.login,
              avatarUrl: c.avatar_url ?? "",
              htmlUrl: c.html_url ?? "",
              commits: c.contributions,
              additions: 0,
              deletions: 0,
            }));
        }
      } catch {
        continue;
      }
    }

    if (contributors.length > 0) {
      results.push({ repoName: repo.githubRepoName, repoUrl: repo.githubRepoUrl, contributors });
    }
  }

  return results;
}
