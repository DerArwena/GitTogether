"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Octokit } from "octokit";
import { revalidatePath } from "next/cache";

const GITHUB_URL_RE = /github\.com[\/:]([^\/\s]+)\/([^\/\s#?.]+?)(?:\.git)?(?:\/|$|\s)/;

const linkRepoSchema = z.object({
  repoUrl: z.string().regex(GITHUB_URL_RE, "Enter a valid GitHub repo URL like https://github.com/owner/repo"),
});

export async function linkRepo(projectId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const member = await db.projectMember.findUnique({
    where: {
      projectId_userId: { projectId, userId: session.user.id },
    },
  });

  if (!member || !["owner", "admin", "maintainer"].includes(member.role)) {
    throw new Error("Forbidden");
  }

  const parsed = linkRepoSchema.parse({
    repoUrl: formData.get("repoUrl"),
  });

  const match = parsed.repoUrl.match(GITHUB_URL_RE);
  if (!match) throw new Error("Invalid GitHub repo URL");
  const [, owner, repo] = match;

  const account = await db.account.findFirst({
    where: { userId: session.user.id, provider: "github" },
    select: { access_token: true },
  });

  let token = account?.access_token;
  if (!token) {
    token = process.env.GITHUB_TOKEN;
    if (!token) {
      throw new Error(
        "No GitHub token available. Sign in with GitHub above, then try again."
      );
    }
  }

  const octokit = new Octokit({ auth: token });

  let repoData;
  try {
    const res = await octokit.rest.repos.get({
      owner,
      repo: repo.replace(/\.git$/i, ""),
    });
    repoData = res.data;
  } catch (err: any) {
    const status = err.status;
    if (status === 401) {
      throw new Error(
        "GitHub token is invalid or expired. Sign out, sign in with GitHub, and try again."
      );
    }
    if (status === 403) {
      throw new Error(
        "GitHub token lacks permission. Make sure your token has access to this repository."
      );
    }
    if (status === 404) {
      const hint = !account
        ? " You signed in via email. Go to Settings → Connected accounts to link GitHub, then try again."
        : "";
      throw new Error(
        `Repository "${owner}/${repo}" not found${hint}`
      );
    }
    throw new Error(
      `GitHub API error (${status ?? "unknown"}): ${err.message ?? "Could not fetch repository"}`
    );
  }

  await db.linkedRepo.create({
    data: {
      projectId,
      githubRepoId: repoData.id,
      githubRepoName: repoData.full_name,
      githubRepoUrl: repoData.html_url,
      defaultBranch: repoData.default_branch,
    },
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function getUserRepos() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const account = await db.account.findFirst({
    where: { userId: session.user.id, provider: "github" },
    select: { access_token: true },
  });

  if (!account?.access_token) return [];

  const octokit = new Octokit({ auth: account.access_token });

  const repos: Array<{ id: number; fullName: string; htmlUrl: string; private: boolean }> = [];
  let checkedScope = false;

  for await (const response of octokit.paginate.iterator(
    "GET /user/repos",
    { sort: "updated", per_page: 100, type: "all" },
  )) {
    if (!checkedScope) {
      const scopes = (response.headers["x-oauth-scopes"] ?? "") as string;
      if (!scopes.includes("repo")) {
        throw new Error(
          "Your GitHub token lacks the 'repo' scope. Go to Settings → Connected accounts and re-connect GitHub, then refresh."
        );
      }
      checkedScope = true;
    }
    for (const r of response.data) {
      repos.push({
        id: r.id,
        fullName: r.full_name,
        htmlUrl: r.html_url,
        private: r.private,
      });
    }
  }

  return repos;
}

export async function unlinkRepo(projectId: string, repoId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const member = await db.projectMember.findUnique({
    where: {
      projectId_userId: { projectId, userId: session.user.id },
    },
  });

  if (!member || !["owner", "admin", "maintainer"].includes(member.role)) {
    throw new Error("Forbidden");
  }

  await db.linkedRepo.delete({ where: { id: repoId } });
  revalidatePath(`/projects/${projectId}`);
}

export async function getIssues(projectId: string, userId?: string) {
  const repos = await db.linkedRepo.findMany({
    where: { projectId },
  });

  if (repos.length === 0) return [];

  const account = userId
    ? await db.account.findFirst({
        where: { userId, provider: "github" },
        select: { access_token: true },
      })
    : null;
  const token = account?.access_token ?? process.env.GITHUB_TOKEN;
  const octokit = new Octokit({ auth: token });
  const issues = await Promise.all(
    repos.map(async (repo) => {
      const [owner, repoName] = repo.githubRepoName.split("/");
      try {
        const { data } = await octokit.rest.issues.listForRepo({
          owner,
          repo: repoName,
          state: "open",
          per_page: 20,
        });
        return data.map((issue) => ({
          id: issue.id,
          number: issue.number,
          title: issue.title,
          htmlUrl: issue.html_url,
          state: issue.state,
          labels: issue.labels.map((l) =>
            typeof l === "string" ? l : l.name
          ),
          createdAt: issue.created_at,
          repoName: repo.githubRepoName,
        }));
      } catch {
        return [];
      }
    })
  );

  return issues.flat().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
