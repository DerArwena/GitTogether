import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { approveJoinRequest, denyJoinRequest } from "@/server/actions/join-request";

export default async function ProjectRequestsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const project = await db.project.findUnique({ where: { slug } });
  if (!project) notFound();

  const member = await db.projectMember.findUnique({
    where: {
      projectId_userId: { projectId: project.id, userId: session.user.id },
    },
  });

  if (!member || !["owner", "admin"].includes(member.role)) {
    redirect(`/projects/${slug}`);
  }

  const pendingRequests = await db.joinRequest.findMany({
    where: { projectId: project.id, status: "pending" },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Join requests
              </h1>
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

          {pendingRequests.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-12 text-center">
              <h2 className="text-lg font-semibold">No pending requests</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Join requests from users will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="rounded-lg border border-border p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {request.user.name ?? request.user.email}
                      </p>
                      {request.message && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          &ldquo;{request.message}&rdquo;
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <form
                        action={approveJoinRequest.bind(null, request.id)}
                      >
                        <Button type="submit" size="sm">
                          Approve
                        </Button>
                      </form>
                      <form
                        action={denyJoinRequest.bind(null, request.id)}
                      >
                        <Button
                          type="submit"
                          variant="outline"
                          size="sm"
                        >
                          Deny
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
