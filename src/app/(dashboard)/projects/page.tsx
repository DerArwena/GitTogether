import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { Plus, FolderKanban, Users, GitFork } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const memberships = await db.projectMember.findMany({
    where: { userId: session.user.id },
    include: {
      project: {
        include: {
          _count: { select: { members: true, linkedRepos: true } },
          owner: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Projects"
        description={`${memberships.length} project${memberships.length === 1 ? "" : "s"} you are part of.`}
        actions={
          <Link href="/projects/new">
            <Button size="sm" className="gap-1.5">
              <Plus className="size-3.5" />
              New project
            </Button>
          </Link>
        }
      />

      {memberships.length === 0 ? (
        <Card>
          <CardContent className="py-14 text-center">
            <div className="flex justify-center mb-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
                <FolderKanban className="size-6 text-muted-foreground" />
              </div>
            </div>
            <h3 className="text-base font-semibold">No projects yet</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-5 max-w-xs mx-auto">
              Create your first project or accept an invite to get started.
            </p>
            <Link href="/projects/new">
              <Button size="sm" className="gap-1.5">
                <Plus className="size-3.5" />
                Create project
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {memberships.map(({ project, role }) => (
            <Link
              key={project.id}
              href={`/projects/${project.slug}`}
              className="group rounded-xl border border-border bg-card p-5 hover:border-foreground/20 hover:shadow-sm transition-all duration-200 hover-lift"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-sm group-hover:text-foreground transition-colors">
                  {project.name}
                </h3>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-medium">
                  {role}
                </span>
              </div>
              {project.description && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
                  {project.description}
                </p>
              )}
              <div className="flex gap-3 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="size-3" />
                  {project._count.members}
                </span>
                <span className="flex items-center gap-1">
                  <GitFork className="size-3" />
                  {project._count.linkedRepos}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
