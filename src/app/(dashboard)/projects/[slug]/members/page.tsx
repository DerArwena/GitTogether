import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ArrowLeft, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const roleColors: Record<string, string> = {
  owner: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  admin: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  maintainer: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  member: "bg-muted text-muted-foreground border-border",
  viewer: "bg-muted/50 text-muted-foreground/60 border-border",
};

export default async function ProjectMembersPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  const project = await db.project.findUnique({
    where: { slug },
    include: {
      members: {
        include: { user: { select: { name: true, email: true, image: true } } },
        orderBy: [{ role: "asc" }, { createdAt: "asc" }],
      },
    },
  });

  if (!project) notFound();

  const currentMember = session?.user?.id
    ? await db.projectMember.findUnique({
        where: {
          projectId_userId: { projectId: project.id, userId: session.user.id },
        },
      })
    : null;

  const canManage = currentMember?.role && ["owner", "admin"].includes(currentMember.role);

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/projects/${slug}`}>
          <Button variant="ghost" size="icon" className="size-8">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Members</h1>
          <p className="text-sm text-muted-foreground">{project.name} · {project.members.length} members</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="divide-y divide-border">
          {project.members.map((member) => (
            <div key={member.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-sm font-medium text-muted-foreground">
                  {member.user.name?.[0] ?? member.user.email?.[0] ?? "?"}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {member.user.name ?? member.user.email}
                  </p>
                  <p className="text-xs text-muted-foreground">{member.user.email}</p>
                </div>
              </div>
              <span className={`text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-md border ${roleColors[member.role] ?? roleColors.member}`}>
                {member.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
