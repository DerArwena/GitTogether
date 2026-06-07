import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";

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

  const ownedRepoCount = await db.project.count({
    where: { ownerId: session.user.id },
  });

  const projectsWithRole = memberships.map((m) => ({
    project: m.project,
    role: m.role,
  }));

  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Your projects and activity
              </p>
            </div>
            <Link href="/projects/new">
              <Button>New project</Button>
            </Link>
          </div>

          {projectsWithRole.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-12 text-center">
              <h2 className="text-lg font-semibold">No projects yet</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Create your first project or accept an invite to get started.
              </p>
              <Link href="/projects/new">
                <Button className="mt-6">Create your first project</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {projectsWithRole.map(({ project, role }) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.slug}`}
                  className="rounded-lg border border-border p-5 hover:border-foreground/20 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold">{project.name}</h3>
                    <span className="text-xs text-muted-foreground capitalize">
                      {role}
                    </span>
                  </div>
                  {project.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
                    <span>{project._count.members} members</span>
                    <span>{project._count.linkedRepos} repos</span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {ownedRepoCount > 0 && (
            <div className="mt-8 rounded-lg border border-border p-4">
              <p className="text-sm text-muted-foreground">
                You own {ownedRepoCount} project{ownedRepoCount !== 1 ? "s" : ""}.
              </p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
