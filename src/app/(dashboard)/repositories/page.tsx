import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { GitFork, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";

export default async function RepositoriesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const memberships = await db.projectMember.findMany({
    where: { userId: session.user.id },
    include: {
      project: {
        include: {
          linkedRepos: { orderBy: { createdAt: "desc" } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const allRepos = memberships
    .filter((m) => m.project.linkedRepos.length > 0)
    .flatMap((m) =>
      m.project.linkedRepos.map((repo) => ({
        ...repo,
        projectName: m.project.name,
        projectSlug: m.project.slug,
      }))
    );

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Repositories"
        description="All linked GitHub repositories across your projects."
      />

      {allRepos.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
          <div className="flex justify-center mb-3">
            <div className="flex size-10 items-center justify-center rounded bg-muted">
              <GitFork className="size-5 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-sm font-semibold">No repositories linked</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            Link a GitHub repository from any project settings to see it here.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="divide-y divide-border">
            {allRepos.map((repo) => (
              <a
                key={repo.id}
                href={repo.githubRepoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3.5 text-sm hover:bg-accent/30 transition-colors group"
              >
                <div className="flex size-7 items-center justify-center rounded bg-muted group-hover:bg-accent transition-colors">
                  <svg viewBox="0 0 24 24" className="size-3.5 text-muted-foreground" fill="currentColor">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12 24 5.37 18.63 0 12 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium">{repo.githubRepoName}</span>
                  <span className="text-muted-foreground ml-2 text-xs">
                    in {repo.projectName} · {repo.defaultBranch}
                  </span>
                </div>
                <ExternalLink className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
