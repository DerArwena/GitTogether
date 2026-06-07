import { GitCommit, GitPullRequest, ExternalLink, Users } from "lucide-react";
import { getContributors, type RepoContributors } from "@/server/actions/contributors";

interface Props {
  projectId: string;
}

export async function ContributorsSection({ projectId }: Props) {
  let data: RepoContributors[] = [];
  let error: string | null = null;

  try {
    data = await getContributors(projectId);
  } catch (e: any) {
    error = e.message ?? "Failed to load contributors";
  }

  if (error) {
    return (
      <section>
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <GitCommit className="size-4 text-muted-foreground" />
          Contribution activity
        </h2>
        <div className="rounded-xl border border-border bg-card p-5 text-center text-xs text-muted-foreground">
          {error}
        </div>
      </section>
    );
  }

  if (data.length === 0) return null;

  const allContributors = data.flatMap((r) => r.contributors);
  const totalCommits = allContributors.reduce((s, c) => s + c.commits, 0);
  const totalAdditions = allContributors.reduce((s, c) => s + c.additions, 0);
  const totalDeletions = allContributors.reduce((s, c) => s + c.deletions, 0);

  const contributorMap = new Map<string, { login: string; avatarUrl: string; htmlUrl: string; commits: number; additions: number; deletions: number; repos: Set<string> }>();
  for (const c of allContributors) {
    const existing = contributorMap.get(c.login);
    if (existing) {
      existing.commits += c.commits;
      existing.additions += c.additions;
      existing.deletions += c.deletions;
    } else {
      contributorMap.set(c.login, { ...c, repos: new Set<string>() });
    }
  }

  for (const repo of data) {
    for (const c of repo.contributors) {
      const entry = contributorMap.get(c.login);
      if (entry) entry.repos.add(repo.repoName);
    }
  }

  const sorted = [...contributorMap.values()].sort((a, b) => b.commits - a.commits);

  return (
    <section>
      <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <GitCommit className="size-4 text-muted-foreground" />
        Contribution activity
      </h2>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl border border-border bg-card p-3.5 text-center">
          <div className="text-lg font-bold tracking-tight">{totalCommits.toLocaleString()}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Commits</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-3.5 text-center">
          <div className="text-lg font-bold tracking-tight text-emerald-500">+{totalAdditions.toLocaleString()}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Additions</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-3.5 text-center">
          <div className="text-lg font-bold tracking-tight text-red-500">-{totalDeletions.toLocaleString()}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Deletions</div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="divide-y divide-border">
          {sorted.map((c, i) => (
            <a
              key={c.login}
              href={c.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors group"
            >
              <span className="w-5 text-center text-xs text-muted-foreground tabular-nums">{i + 1}</span>
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted overflow-hidden">
                {c.avatarUrl ? (
                  <img src={c.avatarUrl} alt={c.login} className="size-full object-cover" />
                ) : (
                  <span className="text-xs font-medium text-muted-foreground">{c.login[0]?.toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium truncate">{c.login}</span>
                <span className="text-muted-foreground ml-2 text-xs">
                  {c.repos.size} repo{c.repos.size !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs tabular-nums">
                <span className="text-muted-foreground">{c.commits} commits</span>
                <span className="text-emerald-500 w-14 text-right">+{c.additions.toLocaleString()}</span>
                <span className="text-red-500 w-14 text-right">-{c.deletions.toLocaleString()}</span>
              </div>
              <ExternalLink className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
