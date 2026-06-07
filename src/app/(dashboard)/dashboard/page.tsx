import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import {
  Plus,
  FolderKanban,
  GitFork,
  Users,
  ArrowRight,
  Activity,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
}: {
  label: string;
  value: number;
  icon: typeof FolderKanban;
  trend?: string;
}) {
  return (
    <Card size="sm">
      <CardContent className="px-4 py-3.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex size-6 items-center justify-center rounded bg-muted">
            <Icon className="size-3 text-muted-foreground" />
          </div>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </span>
        </div>
        <div className="flex items-end justify-between">
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {trend && (
            <span className="flex items-center gap-0.5 text-[11px] text-emerald-500 font-medium">
              <TrendingUp className="size-3" />
              {trend}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
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

  const projectIds = memberships.map((m) => m.projectId);

  const recentRequests = projectIds.length > 0
    ? await db.joinRequest.findMany({
        where: { projectId: { in: projectIds }, status: "pending" },
        include: {
          user: { select: { name: true, email: true } },
          project: { select: { name: true, slug: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      })
    : [];

  const totalRepos = memberships.reduce((s, m) => s + m.project._count.linkedRepos, 0);
  const totalMembers = memberships.reduce((s, m) => s + m.project._count.members, 0);
  const totalPending = recentRequests.length;

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title={`Welcome back, ${session.user.name ?? session.user.email}`}
        description="Here is what is happening across your projects."
        actions={
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-1.5 h-8 rounded-md bg-foreground px-3.5 text-xs font-medium text-background hover:bg-foreground/90 transition-all"
          >
            <Plus className="size-3.5" />
            New project
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Projects"
          value={memberships.length}
          icon={FolderKanban}
          trend={memberships.length > 0 ? `${memberships.length} total` : undefined}
        />
        <StatCard
          label="Repositories"
          value={totalRepos}
          icon={GitFork}
        />
        <StatCard
          label="Team members"
          value={totalMembers}
          icon={Users}
        />
        <StatCard
          label="Pending"
          value={totalPending}
          icon={Activity}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <FolderKanban className="size-4 text-muted-foreground" />
              Your projects
            </h2>
            {memberships.length > 0 && (
              <Link
                href="/projects"
                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                View all <ArrowUpRight className="size-3" />
              </Link>
            )}
          </div>

          {memberships.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="flex justify-center mb-3">
                  <div className="flex size-10 items-center justify-center rounded bg-muted">
                    <FolderKanban className="size-5 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="text-sm font-semibold">No projects yet</h3>
                <p className="text-xs text-muted-foreground mt-1 mb-4 max-w-xs mx-auto">
                  Create your first project or accept an invite to get started.
                </p>
                <Link
                  href="/projects/new"
                  className="inline-flex items-center gap-1.5 h-7 rounded bg-foreground px-3 text-xs font-medium text-background hover:bg-foreground/90 transition-all"
                >
                  <Plus className="size-3" />
                  Create project
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {memberships.slice(0, 6).map(({ project, role }) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.slug}`}
                  className="group rounded-lg border border-border bg-card p-4 hover:border-foreground/20 hover:shadow-sm transition-all duration-200 hover-lift"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-sm group-hover:text-foreground transition-colors">
                      {project.name}
                    </h3>
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-medium">
                      {role}
                    </span>
                  </div>
                  {project.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">
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

          {memberships.length > 6 && (
            <Link
              href="/projects"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              View all projects <ArrowRight className="size-3" />
            </Link>
          )}
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Activity className="size-4 text-muted-foreground" />
            Recent activity
          </h2>

          {recentRequests.length === 0 && memberships.length > 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <div className="flex justify-center mb-2">
                  <div className="flex size-8 items-center justify-center rounded bg-muted">
                    <Activity className="size-4 text-muted-foreground" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">No pending activity.</p>
              </CardContent>
            </Card>
          ) : recentRequests.length === 0 ? null : (
            <div className="rounded-lg border border-border bg-card divide-y divide-border">
              {recentRequests.map((req) => (
                <div key={req.id} className="p-3 text-xs hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="size-1.5 rounded-full bg-yellow-500 shrink-0" />
                    <span className="font-medium truncate">{req.user.name ?? req.user.email}</span>
                  </div>
                  <p className="text-muted-foreground">
                    wants to join <span className="font-medium text-foreground">{req.project.name}</span>
                  </p>
                  <Link
                    href={`/projects/${req.project.slug}/requests`}
                    className="text-foreground hover:underline mt-1 inline-block text-[11px]"
                  >
                    Review
                  </Link>
                </div>
              ))}
            </div>
          )}

          {memberships.length > 0 && (
            <Link
              href="/activity"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              View all activity <ArrowRight className="size-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
