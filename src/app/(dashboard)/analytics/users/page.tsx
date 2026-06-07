import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UsersBarChart } from "@/components/charts/users-bar-chart";

export default async function AnalyticsUsersPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const memberships = await db.projectMember.findMany({
    where: { userId: session.user.id },
    include: {
      project: { select: { name: true, slug: true } },
      user: { select: { name: true, email: true } },
    },
  });

  const projectUsers = new Map<string, { name: string | null; email: string | null }[]>();
  for (const m of memberships) {
    const users = projectUsers.get(m.projectId) ?? [];
    users.push({ name: m.user.name, email: m.user.email });
    projectUsers.set(m.projectId, users);
  }

  const chartData = Array.from(projectUsers.entries()).map(([projectId, users]) => {
    const project = memberships.find(m => m.projectId === projectId)?.project;
    return { name: project?.name ?? "Unknown", users: users.length };
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/analytics">
          <Button variant="ghost" size="icon" className="size-8">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Active users</h1>
          <p className="text-sm text-muted-foreground">Users across your projects</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background p-5">
        <h3 className="text-sm font-semibold mb-4">Users per project</h3>
        <UsersBarChart data={chartData} />
      </div>

      <div className="rounded-lg border border-border bg-background divide-y divide-border">
        {Array.from(projectUsers.entries()).map(([projectId, users]) => {
          const project = memberships.find(m => m.projectId === projectId)?.project;
          return (
            <div key={projectId} className="p-4">
              <h3 className="text-sm font-medium mb-3">{project?.name ?? "Unknown"}</h3>
              <div className="space-y-2">
                {users.map((user, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Users className="size-3.5 text-muted-foreground" />
                    <span>{user.name ?? user.email}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {projectUsers.size === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No projects yet.
          </div>
        )}
      </div>
    </div>
  );
}
