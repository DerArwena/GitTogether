import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { TrendingUp, ArrowLeft } from "lucide-react";
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/analytics">
          <Button variant="ghost" size="icon" className="size-8">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Growth</h1>
          <p className="text-sm text-muted-foreground">Growth metrics over time</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-background p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="size-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Projects</span>
          </div>
          <p className="text-2xl font-semibold">{memberships.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-background p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="size-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Total members</span>
          </div>
          <p className="text-2xl font-semibold">
            {memberships.reduce((s, m) => s + m.project._count.members, 0)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-background p-5">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <TrendingUp className="size-4" />
            <span className="text-xs font-medium uppercase tracking-wider">Total repos</span>
          </div>
          <p className="text-2xl font-semibold">
            {memberships.reduce((s, m) => s + m.project._count.linkedRepos, 0)}
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background p-5">
        <h3 className="text-sm font-semibold mb-4">Cumulative growth over time</h3>
        <GrowthLineChart data={growthData} />
      </div>
    </div>
  );
}
