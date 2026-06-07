import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Users, Activity, BarChart3, GitCommit } from "lucide-react";
import { MembersBarChart } from "@/components/charts/members-bar-chart";
import { ReposPieChart } from "@/components/charts/repos-pie-chart";

export default async function AnalyticsPage() {
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
  });

  const totalProjects = memberships.length;
  const totalMembers = memberships.reduce((s, m) => s + m.project._count.members, 0);
  const totalRepos = memberships.reduce((s, m) => s + m.project._count.linkedRepos, 0);

  const barData = memberships.map(({ project }) => ({
    name: project.name,
    members: project._count.members,
  }));

  const pieData = memberships
    .filter(({ project }) => project._count.linkedRepos > 0)
    .map(({ project }) => ({
      name: project.name,
      repos: project._count.linkedRepos,
    }));

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
      Overview of your workspace activity and growth.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-background p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <BarChart3 className="size-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Projects</span>
          </div>
          <p className="text-2xl font-semibold">{totalProjects}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users className="size-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Members</span>
          </div>
          <p className="text-2xl font-semibold">{totalMembers}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <GitCommit className="size-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Repos</span>
          </div>
          <p className="text-2xl font-semibold">{totalRepos}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Activity className="size-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Avg size</span>
          </div>
          <p className="text-2xl font-semibold">
            {totalProjects > 0 ? (totalMembers / totalProjects).toFixed(1) : "—"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-background p-5">
          <h3 className="text-sm font-semibold mb-4">Members per project</h3>
          <MembersBarChart data={barData} />
        </div>
        <div className="rounded-lg border border-border bg-background p-5">
          <h3 className="text-sm font-semibold mb-4">Repository distribution</h3>
          <ReposPieChart data={pieData} />
        </div>
      </div>
    </div>
  );
}
