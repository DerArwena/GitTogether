import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ArrowLeft, Activity } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AuditPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const recentRequests = await db.joinRequest.findMany({
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      project: { select: { name: true, slug: true } },
      reviewer: { select: { name: true } },
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon" className="size-8">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Audit log</h1>
          <p className="text-sm text-muted-foreground">Recent activity across all projects</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background divide-y divide-border">
        {recentRequests.map((req) => (
          <div key={req.id} className="flex items-start gap-3 p-4">
            <Activity className="size-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="text-sm min-w-0">
              <p>
                <span className="font-medium">{req.user.name ?? req.user.email}</span>
                {" "}requested to join{" "}
                <Link href={`/projects/${req.project.slug}`} className="font-medium hover:underline">
                  {req.project.name}
                </Link>
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(req.createdAt).toLocaleString()}
                {req.reviewer && ` · Reviewed by ${req.reviewer.name}`}
                {" · "}
                <span className={req.status === "approved" ? "text-green-600" : req.status === "denied" ? "text-red-600" : ""}>
                  {req.status}
                </span>
              </p>
            </div>
          </div>
        ))}
        {recentRequests.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No activity recorded yet.
          </div>
        )}
      </div>
    </div>
  );
}
