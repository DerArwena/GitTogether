import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";

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

  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {project.name}
              </h1>
              {project.description && (
                <p className="mt-2 text-muted-foreground">
                  {project.description}
                </p>
              )}
              <div className="mt-3 flex gap-4 text-sm text-muted-foreground">
                <span>{project._count.members} members</span>
                <span>{project._count.linkedRepos} repos</span>
              </div>
            </div>

            <div className="flex gap-2">
              {canManage && (
                <Link href={`/projects/${slug}/settings`}>
                  <Button variant="outline" size="sm">
                    Settings
                  </Button>
                </Link>
              )}
              <Link href={`/projects/${slug}/members`}>
                <Button variant="outline" size="sm">
                  Members
                </Button>
              </Link>
              <Link href={`/projects/${slug}/issues`}>
                <Button variant="outline" size="sm">
                  Issues
                </Button>
              </Link>
            </div>
          </div>

          {project.linkedRepos.length > 0 && (
            <div className="mt-10">
              <h2 className="text-lg font-semibold">Repositories</h2>
              <div className="mt-3 space-y-2">
                {project.linkedRepos.map((repo) => (
                  <a
                    key={repo.id}
                    href={repo.githubRepoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm hover:border-foreground/20 transition-colors"
                  >
                    <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12 24 5.37 18.63 0 12 0z" />
                    </svg>
                    <span className="font-medium">{repo.githubRepoName}</span>
                    <span className="text-muted-foreground">— {repo.defaultBranch}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10">
            <h2 className="text-lg font-semibold">Members</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {project.members.slice(0, 6).map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 rounded-lg border border-border p-3"
                >
                  <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {member.user.name?.[0] ?? member.user.email?.[0] ?? "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {member.user.name ?? member.user.email}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {member.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {project.members.length > 6 && (
              <Link
                href={`/projects/${slug}/members`}
                className="mt-3 inline-block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                View all {project.members.length} members
              </Link>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
