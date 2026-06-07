import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ArrowLeft, Check, X } from "lucide-react";
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
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/projects/${slug}`}>
          <Button variant="ghost" size="icon" className="size-8">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Join requests</h1>
          <p className="text-sm text-muted-foreground">{project.name}</p>
        </div>
      </div>

      {pendingRequests.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <h3 className="font-medium">No pending requests</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Join requests from users will appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-background divide-y divide-border">
          {pendingRequests.map((request) => (
            <div key={request.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {request.user.name ?? request.user.email}
                  </p>
                  {request.message && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      &ldquo;{request.message}&rdquo;
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={approveJoinRequest.bind(null, request.id)}>
                    <Button type="submit" size="sm">
                      <Check className="size-3.5 mr-1" />
                      Approve
                    </Button>
                  </form>
                  <form action={denyJoinRequest.bind(null, request.id)}>
                    <Button type="submit" variant="outline" size="sm">
                      <X className="size-3.5 mr-1" />
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
  );
}
