import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Users, Activity, BarChart3, GitCommit } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
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
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Analytics"
        description="Overview of your workspace activity and growth."
      />

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Projects", value: totalProjects, icon: BarChart3 },
          { label: "Members", value: totalMembers, icon: Users },
          { label: "Repos", value: totalRepos, icon: GitCommit },
          { label: "Avg size", value: totalProjects > 0 ? (totalMembers / totalProjects).toFixed(1) : "—", icon: Activity },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex size-6 items-center justify-center rounded bg-muted">
                <Icon className="size-3 text-muted-foreground" />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Members per project</h3>
          <MembersBarChart data={barData} />
        </div>
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">Repository distribution</h3>
          <ReposPieChart data={pieData} />
        </div>
      </div>
    </div>
  );
}
