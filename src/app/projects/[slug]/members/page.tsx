import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";

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

  const role = currentMember?.role as string | undefined;
  const canManage = role && ["owner", "admin"].includes(role);

  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Members</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {project.name}
              </p>
            </div>
            <Link href={`/projects/${slug}`}>
              <Button variant="outline" size="sm">
                Back to project
              </Button>
            </Link>
          </div>

          <div className="space-y-2">
            {project.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border border-border p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {member.user.name?.[0] ?? member.user.email?.[0] ?? "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {member.user.name ?? member.user.email}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {member.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
