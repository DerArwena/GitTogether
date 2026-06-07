import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { Plus, FolderKanban, GitFork, Users } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const memberships = await db.projectMember.findMany({
    where: { userId: session.user.id },
    include: {
      project: {
        include: {
          _count: { select: { members: true, linkedRepos: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalRepos = memberships.reduce(
    (sum, m) => sum + m.project._count.linkedRepos, 0
  );

  return (
    <div className="p-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome back, {session.user.name ?? session.user.email}
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-1.5 h-9 rounded-lg bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/90 transition-colors"
        >
          <Plus className="size-4" />
          New project
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-background p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <FolderKanban className="size-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Projects</span>
          </div>
          <p className="text-2xl font-semibold">{memberships.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <GitFork className="size-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Repos</span>
          </div>
          <p className="text-2xl font-semibold">{totalRepos}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users className="size-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Teams</span>
          </div>
          <p className="text-2xl font-semibold">
            {memberships.reduce((s, m) => s + m.project._count.members, 0)}
          </p>
        </div>
      </div>

      <section>
        <h2 className="text-sm font-semibold mb-3">Your projects</h2>
        {memberships.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-10 text-center">
            <FolderKanban className="size-8 mx-auto text-muted-foreground mb-3" />
            <h3 className="font-medium">No projects yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-4">
              Create your first project or accept an invite to get started.
            </p>
            <Link
              href="/projects/new"
              className="inline-flex items-center gap-1.5 h-8 rounded-md bg-foreground px-3 text-xs font-medium text-background hover:bg-foreground/90 transition-colors"
            >
              <Plus className="size-3.5" />
              Create project
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {memberships.map(({ project, role }) => (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                className="rounded-lg border border-border bg-background p-4 hover:border-foreground/20 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-sm">{project.name}</h3>
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {role}
                  </span>
                </div>
                {project.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {project.description}
                  </p>
                )}
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>{project._count.members} members</span>
                  <span>{project._count.linkedRepos} repos</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
