import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { GitPullRequest, ExternalLink, GitFork } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Octokit } from "octokit";

export default async function PullRequestsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const memberships = await db.projectMember.findMany({
    where: { userId: session.user.id },
    include: {
      project: {
        include: {
          linkedRepos: true,
        },
      },
    },
  });

  const allRepos = memberships.flatMap((m) =>
    m.project.linkedRepos.map((repo) => ({
      ...repo,
      projectName: m.project.name,
      projectSlug: m.project.slug,
    }))
  );

  const account = await db.account.findFirst({
    where: { userId: session.user.id, provider: "github" },
    select: { access_token: true },
  });
  const token = account?.access_token ?? process.env.GITHUB_TOKEN;

  let pulls: Array<{
    id: number;
    title: string;
    number: number;
    htmlUrl: string;
    state: string;
    repoName: string;
    createdAt: string;
    user: string;
  }> = [];

  if (token && allRepos.length > 0) {
    const octokit = new Octokit({ auth: token });
    const results = await Promise.allSettled(
      allRepos.map(async (repo) => {
        const [owner, repoName] = repo.githubRepoName.split("/");
        const { data } = await octokit.rest.pulls.list({
          owner,
          repo: repoName,
          state: "open",
          per_page: 10,
        });
        return data.map((pr) => ({
          id: pr.id,
          title: pr.title,
          number: pr.number,
          htmlUrl: pr.html_url,
          state: pr.state,
          repoName: repo.githubRepoName,
          createdAt: pr.created_at,
          user: pr.user?.login ?? "unknown",
        }));
      })
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        pulls.push(...result.value);
      }
    }

    pulls.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Pull Requests"
        description="Open pull requests across your linked repositories."
      />

      {allRepos.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
          <div className="flex justify-center mb-3">
            <div className="flex size-10 items-center justify-center rounded bg-muted">
              <GitFork className="size-5 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-sm font-semibold">No repositories linked</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Link a GitHub repository to see its pull requests.
          </p>
        </div>
      ) : pulls.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
          <div className="flex justify-center mb-3">
            <div className="flex size-10 items-center justify-center rounded bg-muted">
              <GitPullRequest className="size-5 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-sm font-semibold">No open pull requests</h3>
          <p className="text-xs text-muted-foreground mt-1">
            All linked repositories have zero open PRs.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="divide-y divide-border">
            {pulls.map((pr) => (
              <a
                key={pr.id}
                href={pr.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3.5 text-sm hover:bg-accent/30 transition-colors group"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-green-600/10 text-[10px] text-green-600 font-semibold">
                  <GitPullRequest className="size-3" />
                </span>
                <span className="font-medium flex-1 min-w-0 truncate">{pr.title}</span>
                <span className="text-xs text-muted-foreground shrink-0 bg-muted px-1.5 py-0.5 rounded">
                  {pr.repoName}#{pr.number}
                </span>
                <span className="text-[11px] text-muted-foreground hidden sm:inline">
                  by {pr.user}
                </span>
                <ExternalLink className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
