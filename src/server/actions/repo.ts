"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Octokit } from "octokit";
import { revalidatePath } from "next/cache";

const linkRepoSchema = z.object({
  repoUrl: z.string().url().regex(/github\.com\/(.+)\/(.+)/, "Must be a GitHub repo URL"),
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

  const match = parsed.repoUrl.match(/github\.com\/([^/]+)\/([^/]+?)(?:\/|$)/);
  if (!match) throw new Error("Invalid GitHub repo URL");

  const [, owner, repo] = match;

  const octokit = new Octokit();
  const { data: repoData } = await octokit.rest.repos.get({
    owner,
    repo: repo.replace(/\.git$/, ""),
  });

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

export async function getIssues(projectId: string) {
  const repos = await db.linkedRepo.findMany({
    where: { projectId },
  });

  if (repos.length === 0) return [];

  const octokit = new Octokit();
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
