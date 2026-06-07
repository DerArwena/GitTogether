import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Activity, UserPlus, GitFork, PlusCircle, LogIn } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";

type Event = {
  id: string;
  type: "join_request" | "member_added" | "project_created" | "repo_linked";
  description: string;
  timestamp: Date;
  projectName: string;
  projectSlug?: string;
  user: string;
};

export default async function ActivityPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const memberships = await db.projectMember.findMany({
    where: { userId: session.user.id },
    include: {
      project: {
        select: { id: true, name: true, slug: true, createdAt: true, ownerId: true },
      },
    },
  });

  const projectIds = memberships.map((m) => m.projectId);
  const myProjectIds = memberships
    .filter((m) => m.project.ownerId === session.user.id)
    .map((m) => m.projectId);

  const events: Event[] = [];

  const joinRequests = await db.joinRequest.findMany({
    where: { projectId: { in: projectIds } },
    include: {
      user: { select: { name: true, email: true } },
      project: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  for (const req of joinRequests) {
    events.push({
      id: `jr-${req.id}`,
      type: "join_request" as const,
      description:
        req.status === "pending"
          ? "requested to join"
          : req.status === "approved"
            ? "was approved to join"
            : "was denied from joining",
      timestamp: req.createdAt,
      projectName: req.project.name,
      projectSlug: req.project.slug,
      user: req.user.name ?? req.user.email ?? "Unknown",
    });
  }

  for (const m of memberships) {
    if (myProjectIds.includes(m.project.id)) {
      events.push({
        id: `proj-${m.project.id}`,
        type: "project_created" as const,
        description: "created project",
        timestamp: m.project.createdAt,
        projectName: m.project.name,
        projectSlug: m.project.slug,
        user: session.user.name ?? session.user.email ?? "You",
      });
    }
  }

  events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  const uniqueEvents = events.slice(0, 30);

  function EventIcon({ type }: { type: Event["type"] }) {
    switch (type) {
      case "join_request":
        return <LogIn className="size-3.5" />;
      case "member_added":
        return <UserPlus className="size-3.5" />;
      case "project_created":
        return <PlusCircle className="size-3.5" />;
      case "repo_linked":
        return <GitFork className="size-3.5" />;
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Activity"
        description="Recent events across your workspace."
      />

      {uniqueEvents.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
          <div className="flex justify-center mb-3">
            <div className="flex size-10 items-center justify-center rounded bg-muted">
              <Activity className="size-5 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-sm font-semibold">No activity yet</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Events will appear here as your workspace grows.
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
          <div className="space-y-4">
            {uniqueEvents.map((event) => (
              <div key={event.id} className="relative pl-10">
                <div className="absolute left-[9px] flex size-[15px] items-center justify-center rounded-full bg-background border border-border">
                  <span className="text-muted-foreground">
                    <EventIcon type={event.type} />
                  </span>
                </div>
                <div className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-center gap-2 text-xs mb-0.5">
                    <span className="font-medium">{event.user}</span>
                    <span className="text-muted-foreground">{event.description}</span>
                    {event.projectSlug ? (
                      <a
                        href={`/projects/${event.projectSlug}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {event.projectName}
                      </a>
                    ) : (
                      <span className="font-medium">{event.projectName}</span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    {event.timestamp.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
