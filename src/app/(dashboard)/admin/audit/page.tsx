import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ArrowLeft, Activity, UserPlus, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const statusConfig = {
  pending: { icon: UserPlus, color: "text-yellow-600 bg-yellow-500/10" },
  approved: { icon: CheckCircle, color: "text-green-600 bg-green-500/10" },
  denied: { icon: XCircle, color: "text-red-600 bg-red-500/10" },
};

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
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon" className="size-8">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Audit log</h1>
          <p className="text-sm text-muted-foreground">Recent activity across all projects</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="divide-y divide-border">
          {recentRequests.map((req) => {
            const config = statusConfig[req.status] ?? statusConfig.pending;
            const Icon = config.icon;
            return (
              <div key={req.id} className="flex items-start gap-3 p-4 hover:bg-accent/30 transition-colors">
                <div className={`flex size-8 items-center justify-center rounded-lg ${config.color}`}>
                  <Icon className="size-4" />
                </div>
                <div className="text-sm min-w-0 flex-1">
                  <p>
                    <span className="font-medium">{req.user.name ?? req.user.email}</span>
                    {" "}requested to join{" "}
                    <Link href={`/projects/${req.project.slug}`} className="font-medium hover:underline text-chart-1">
                      {req.project.name}
                    </Link>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(req.createdAt).toLocaleString()}
                    {req.reviewer && ` · Reviewed by ${req.reviewer.name}`}
                  </p>
                </div>
                <span className={`text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded-md border ${
                  req.status === "approved" ? "text-green-600 border-green-600/20 bg-green-500/5" :
                  req.status === "denied" ? "text-red-600 border-red-600/20 bg-red-500/5" :
                  "text-yellow-600 border-yellow-600/20 bg-yellow-500/5"
                }`}>
                  {req.status}
                </span>
              </div>
            );
          })}
          {recentRequests.length === 0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No activity recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
