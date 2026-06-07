import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Users } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";

export default async function TeamPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const memberships = await db.projectMember.findMany({
    where: { userId: session.user.id },
    include: {
      project: {
        include: {
          members: {
            include: {
              user: { select: { id: true, name: true, email: true, image: true } },
            },
          },
        },
      },
    },
  });

  const userMap = new Map<string, {
    name: string | null;
    email: string | null;
    image: string | null;
    projects: { name: string; slug: string; role: string }[];
  }>();

  for (const m of memberships) {
    for (const pm of m.project.members) {
      const id = pm.user.id;
      if (!userMap.has(id)) {
        userMap.set(id, {
          name: pm.user.name,
          email: pm.user.email,
          image: pm.user.image,
          projects: [],
        });
      }
      userMap.get(id)!.projects.push({
        name: m.project.name,
        slug: m.project.slug,
        role: pm.role,
      });
    }
  }

  const teamMembers = Array.from(userMap.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => {
      if (a.id === session.user.id) return -1;
      if (b.id === session.user.id) return 1;
      return (a.name ?? a.email ?? "").localeCompare(b.name ?? b.email ?? "");
    });

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Team"
        description={`${teamMembers.length} member${teamMembers.length === 1 ? "" : "s"} across your projects.`}
      />

      {teamMembers.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
          <div className="flex justify-center mb-3">
            <div className="flex size-10 items-center justify-center rounded bg-muted">
              <Users className="size-5 text-muted-foreground" />
            </div>
          </div>
          <h3 className="text-sm font-semibold">No team members</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Add members to your projects to build your team.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <div className="divide-y divide-border">
            {teamMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3.5 hover:bg-accent/30 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex size-8 items-center justify-center rounded bg-muted text-xs font-medium text-muted-foreground shrink-0">
                    {member.name?.[0] ?? member.email?.[0] ?? "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {member.name ?? member.email}
                      {member.id === session.user.id && (
                        <span className="text-[11px] text-muted-foreground font-normal ml-1.5">(you)</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                  </div>
                </div>
                <div className="flex gap-1.5 shrink-0 ml-3">
                  {member.projects.slice(0, 3).map((p) => (
                    <a
                      key={p.slug}
                      href={`/projects/${p.slug}`}
                      className="text-[10px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {p.name}
                    </a>
                  ))}
                  {member.projects.length > 3 && (
                    <span className="text-[10px] text-muted-foreground px-1">
                      +{member.projects.length - 3}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
