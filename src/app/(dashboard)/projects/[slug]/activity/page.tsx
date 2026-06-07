import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ArrowLeft, GitCommit, GitPullRequest, Code2, GitBranch, ExternalLink } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { getProjectActivity } from "@/server/actions/activity";
import { getContributors } from "@/server/actions/contributors";

export default async function ProjectActivityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const project = await db.project.findUnique({
    where: { slug },
    include: { _count: { select: { linkedRepos: true } } },
  });

  if (!project) notFound();

  const [activity, contributors] = await Promise.all([
    getProjectActivity(project.id),
    getContributors(project.id),
  ]);

  const totalCommits = activity.recentCommits.length;
  const totalContributors = contributors.reduce((s, r) => s + r.contributors.length, 0);
  const languages = [...new Set(activity.repos.map((r) => r.language).filter(Boolean))];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex items-center gap-4">
        <Link href={`/projects/${slug}`}>
          <Button variant="ghost" size="icon" className="size-8">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Activity</h1>
          <p className="text-sm text-muted-foreground">{project.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border bg-card p-3.5 text-center">
          <GitCommit className="size-4 mx-auto mb-1 text-muted-foreground" />
          <div className="text-lg font-bold tracking-tight">{totalCommits}</div>
          <div className="text-[11px] text-muted-foreground">Recent commits</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-3.5 text-center">
          <Code2 className="size-4 mx-auto mb-1 text-muted-foreground" />
          <div className="text-lg font-bold tracking-tight">{totalContributors}</div>
          <div className="text-[11px] text-muted-foreground">Contributors</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-3.5 text-center">
          <GitBranch className="size-4 mx-auto mb-1 text-muted-foreground" />
          <div className="text-lg font-bold tracking-tight">{activity.repos.length}</div>
          <div className="text-[11px] text-muted-foreground">Repositories</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-3.5 text-center">
          <GitPullRequest className="size-4 mx-auto mb-1 text-muted-foreground" />
          <div className="text-lg font-bold tracking-tight">{activity.repos.reduce((s, r) => s + r.openIssues, 0)}</div>
          <div className="text-[11px] text-muted-foreground">Open issues</div>
        </div>
      </div>

      {languages.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-3">Languages</h2>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang) => (
              <span key={lang} className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                {lang}
              </span>
            ))}
          </div>
        </section>
      )}

      {contributors.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <GitCommit className="size-4 text-muted-foreground" />
            Top contributors
          </h2>
          {contributors.map((repo) => (
            <div key={repo.repoName} className="mb-4">
              <a
                href={repo.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 mb-2"
              >
                {repo.repoName}
                <ExternalLink className="size-3" />
              </a>
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                {repo.contributors.slice(0, 5).map((c, i) => (
                  <a
                    key={c.login}
                    href={c.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-muted/50 transition-colors border-b border-border last:border-0"
                  >
                    <span className="w-5 text-center text-xs text-muted-foreground tabular-nums">{i + 1}</span>
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted overflow-hidden">
                      {c.avatarUrl ? (
                        <img src={c.avatarUrl} alt={c.login} className="size-full object-cover" />
                      ) : (
                        <span className="text-xs font-medium text-muted-foreground">{c.login[0]}</span>
                      )}
                    </div>
                    <span className="flex-1 font-medium">{c.login}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{c.commits} commits</span>
                    <span className="text-xs text-emerald-500 tabular-nums">+{c.additions.toLocaleString()}</span>
                    <span className="text-xs text-red-500 tabular-nums">-{c.deletions.toLocaleString()}</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {activity.recentCommits.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <GitCommit className="size-4 text-muted-foreground" />
            Recent commits
          </h2>
          <div className="rounded-xl border border-border bg-card divide-y divide-border">
            {activity.recentCommits.map((commit) => (
              <a
                key={commit.sha}
                href={commit.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors group"
              >
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted overflow-hidden mt-0.5">
                  {commit.authorAvatar ? (
                    <img src={commit.authorAvatar} alt={commit.author} className="size-full object-cover" />
                  ) : (
                    <span className="text-xs font-medium text-muted-foreground">{commit.author[0]}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{commit.message.split("\n")[0]}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {commit.author} · {commit.repoName} · {formatRelativeTime(commit.date)}
                  </p>
                </div>
                <ExternalLink className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}


