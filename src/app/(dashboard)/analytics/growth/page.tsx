import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { TrendingUp, ArrowLeft, BarChart3, Users, GitCommit } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GrowthLineChart } from "@/components/charts/growth-line-chart";

async function buildGrowthData(userId: string) {
  const projects = await db.project.findMany({
    where: { members: { some: { userId } } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const members = await db.projectMember.findMany({
    where: { project: { members: { some: { userId } } } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const repos = await db.linkedRepo.findMany({
    where: { project: { members: { some: { userId } } } },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const monthMap = new Map<string, { projects: number; members: number; repos: number }>();

  for (const p of projects) {
    const key = p.createdAt.toISOString().slice(0, 7);
    if (!monthMap.has(key)) monthMap.set(key, { projects: 0, members: 0, repos: 0 });
    monthMap.get(key)!.projects++;
  }
  for (const m of members) {
    const key = m.createdAt.toISOString().slice(0, 7);
    if (!monthMap.has(key)) monthMap.set(key, { projects: 0, members: 0, repos: 0 });
    monthMap.get(key)!.members++;
  }
  for (const r of repos) {
    const key = r.createdAt.toISOString().slice(0, 7);
    if (!monthMap.has(key)) monthMap.set(key, { projects: 0, members: 0, repos: 0 });
    monthMap.get(key)!.repos++;
  }

  const sortedMonths = Array.from(monthMap.keys()).sort();
  let cumProjects = 0;
  let cumMembers = 0;
  let cumRepos = 0;

  return sortedMonths.map((month) => {
    const vals = monthMap.get(month)!;
    cumProjects += vals.projects;
    cumMembers += vals.members;
    cumRepos += vals.repos;
    return {
      month,
      projects: cumProjects,
      members: cumMembers,
      repos: cumRepos,
    };
  });
}

export default async function GrowthPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const memberships = await db.projectMember.findMany({
    where: { userId: session.user.id },
    include: {
      project: {
        include: { _count: { select: { members: true, linkedRepos: true } } },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const growthData = await buildGrowthData(session.user.id);

  const stats = [
    { label: "Projects", value: memberships.length, icon: BarChart3, color: "from-chart-1/20 to-chart-1/5", iconColor: "text-chart-1" },
    { label: "Members", value: memberships.reduce((s, m) => s + m.project._count.members, 0), icon: Users, color: "from-chart-2/20 to-chart-2/5", iconColor: "text-chart-2" },
    { label: "Repos", value: memberships.reduce((s, m) => s + m.project._count.linkedRepos, 0), icon: GitCommit, color: "from-chart-3/20 to-chart-3/5", iconColor: "text-chart-3" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/analytics">
          <Button variant="ghost" size="icon" className="size-8 rounded-lg">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Growth</h1>
          <p className="text-sm text-muted-foreground">Growth metrics over time</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, color, iconColor }) => (
          <div key={label} className="relative rounded-xl border border-border bg-card p-5 overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${color}`} />
            <div className="relative">
              <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
                <Icon className={`size-4 ${iconColor}`} />
                <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
              </div>
              <p className="text-3xl font-bold tracking-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold mb-4">Cumulative growth over time</h3>
        <GrowthLineChart data={growthData} />
      </div>
    </div>
  );
}
