import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Settings, Users, AlertCircle, ExternalLink, GitFork, Activity, GitCommit, LayoutList, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContributorsSection } from "@/components/projects/contributors-section";
import { getProjectActivity } from "@/server/actions/activity";
import { formatRelativeTime } from "@/lib/utils";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  const project = await db.project.findUnique({
    where: { slug },
    include: {
      owner: { select: { name: true, email: true } },
      members: {
        include: { user: { select: { name: true, email: true, image: true } } },
        orderBy: { role: "asc" },
      },
      linkedRepos: true,
      _count: { select: { members: true, linkedRepos: true } },
    },
  });

  if (!project) notFound();

  const currentMember = session?.user?.id
    ? await db.projectMember.findUnique({
        where: {
          projectId_userId: { projectId: project.id, userId: session.user.id },
        },
      })
    : null;

  const role = currentMember?.role as string | undefined;
  const canManage = role && ["owner", "admin", "maintainer"].includes(role);

  const activity = project.linkedRepos.length > 0
    ? await getProjectActivity(project.id).catch(() => null)
    : null;

  const repoActivity = new Map(activity?.repos.map((r) => [r.name, r]) ?? []);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
            <Badge variant="outline" className="text-[10px] capitalize rounded-md">
              {project.isPublic ? "Public" : "Private"}
            </Badge>
          </div>
          {project.description && (
            <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
          )}
          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Users className="size-3.5" /> {project._count.members} members</span>
            <span className="flex items-center gap-1"><GitFork className="size-3.5" /> {project._count.linkedRepos} repositories</span>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href={`/projects/${slug}/activity`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Activity className="size-3.5" />
              Activity
            </Button>
          </Link>
          <Link href={`/projects/${slug}/issues`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <AlertCircle className="size-3.5" />
              Issues
            </Button>
          </Link>
          <Link href={`/projects/${slug}/tasks`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <LayoutList className="size-3.5" />
              Tasks
            </Button>
          </Link>
          <Link href={`/projects/${slug}/chat`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <MessageSquareText className="size-3.5" />
              Chat
            </Button>
          </Link>
          <Link href={`/projects/${slug}/members`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Users className="size-3.5" />
              Members
            </Button>
          </Link>
          {canManage && (
            <Link href={`/projects/${slug}/settings`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Settings className="size-3.5" />
                Settings
              </Button>
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-8">
          {project.linkedRepos.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <GitFork className="size-4 text-muted-foreground" />
                Repositories
              </h2>
              <div className="space-y-2">
                {project.linkedRepos.map((repo) => {
                  const live = repoActivity.get(repo.githubRepoName);
                  return (
                    <a
                      key={repo.id}
                      href={repo.githubRepoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 text-sm hover:shadow-card-hover hover:border-foreground/20 transition-all duration-200 hover-lift"
                    >
                      <div className="flex size-8 items-center justify-center rounded-lg bg-muted group-hover:bg-chart-1/10 transition-colors">
                        <svg viewBox="0 0 24 24" className="size-4 text-muted-foreground group-hover:text-chart-1 transition-colors" fill="currentColor">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12 24 5.37 18.63 0 12 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{repo.githubRepoName}</span>
                          {live?.language && (
                            <span className="text-[10px] text-muted-foreground border border-border rounded px-1.5 leading-tight">{live.language}</span>
                          )}
                        </div>
                        {live?.lastCommit && (
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            <GitCommit className="size-3 inline mr-1" />
                            {live.lastCommit.message.split("\n")[0]} — {formatRelativeTime(live.lastCommit.date)}
                          </p>
                        )}
                      </div>
                      <span className="text-muted-foreground hidden sm:inline text-xs">· {repo.defaultBranch}</span>
                      <ExternalLink className="size-3.5 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </a>
                  );
                })}
              </div>
            </section>
          )}

          {activity && activity.recentCommits.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <GitCommit className="size-4 text-muted-foreground" />
                Recent commits
              </h2>
              <div className="rounded-xl border border-border bg-card divide-y divide-border">
                {activity.recentCommits.slice(0, 10).map((commit) => (
                  <a
                    key={commit.sha}
                    href={commit.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted overflow-hidden">
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
                    <ExternalLink className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              Members
              <span className="text-muted-foreground font-normal">({project.members.length})</span>
            </h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {project.members.slice(0, 6).map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover-lift"
                >
                  <div className="flex size-9 items-center justify-center rounded-lg bg-muted text-sm font-medium text-muted-foreground">
                    {member.user.name?.[0] ?? member.user.email?.[0] ?? "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {member.user.name ?? member.user.email}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
            {project.members.length > 6 && (
              <Link
                href={`/projects/${slug}/members`}
                className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                View all {project.members.length} members
              </Link>
            )}
          </section>

          <ContributorsSection projectId={project.id} />
        </div>
      </div>
    </div>
  );
}


