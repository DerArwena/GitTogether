import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ArrowLeft, Users, Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function TeamSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const memberships = await db.projectMember.findMany({
    where: { userId: session.user.id },
    select: { projectId: true },
  });

  const projectIds = memberships.map((m) => m.projectId);

  const teamMembers = await db.projectMember.findMany({
    where: { projectId: { in: projectIds } },
    include: {
      user: { select: { id: true, name: true, email: true, image: true } },
      project: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const uniqueUsers = new Map<string, { name: string | null; email: string | null; projects: string[] }>();
  for (const tm of teamMembers) {
    const uid = tm.user.id;
    if (!uniqueUsers.has(uid)) {
      uniqueUsers.set(uid, { name: tm.user.name, email: tm.user.email, projects: [] });
    }
    uniqueUsers.get(uid)!.projects.push(tm.project.name);
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="size-8">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Team</h1>
          <p className="text-sm text-muted-foreground">People you collaborate with</p>
        </div>
      </div>

      {uniqueUsers.size === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <Users className="size-8 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No team members yet. Create or join a project first.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-background divide-y divide-border">
          {Array.from(uniqueUsers.entries()).map(([id, user]) => (
            <div key={id} className="flex items-center gap-3 p-3">
              <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                {user.name?.[0] ?? user.email?.[0] ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name ?? "Unknown"}</p>
                <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                  <Mail className="size-3" />
                  {user.email}
                </p>
              </div>
              <div className="text-xs text-muted-foreground text-right">
                <p>{user.projects.length} project{user.projects.length !== 1 ? "s" : ""}</p>
                <p className="truncate max-w-32">{user.projects.join(", ")}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
