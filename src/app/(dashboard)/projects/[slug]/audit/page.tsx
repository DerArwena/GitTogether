import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { getProjectAuditLogs } from "@/server/actions/audit"
import { auditActionLabels } from "@/lib/audit-labels"
import { PageHeader } from "@/components/layout/page-header"
import { formatRelativeTime } from "@/lib/utils"
import { Activity, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default async function ProjectAuditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await auth()
  if (!session?.user) redirect("/auth/signin")

  const project = await db.project.findUnique({ where: { slug } })
  if (!project) notFound()

  const res = await getProjectAuditLogs(project.id)
  const { logs, total } = (res.success && res.data) ? res.data : { logs: [], total: 0 }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <Link
          href={`/projects/${slug}`}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors"
        >
          <ArrowLeft className="size-3" />
          Back to project
        </Link>
        <PageHeader title="Audit Log" description={`${total} events recorded for ${project.name}`} />
      </div>

      <div className="rounded-xl border border-border bg-card divide-y divide-border">
        {logs.length === 0 ? (
          <div className="p-8 text-center">
            <div className="flex justify-center mb-2">
              <div className="flex size-8 items-center justify-center rounded bg-muted">
                <Activity className="size-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">No audit events yet.</p>
          </div>
        ) : (
          logs.map((log: any) => (
            <div key={log.id} className="px-4 py-3 flex items-center gap-3 text-sm">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground overflow-hidden">
                {log.user.image ? (
                  <img src={log.user.image} alt="" className="size-full object-cover" />
                ) : (
                  log.user.name?.[0] ?? "?"
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p>
                  <span className="font-medium">{log.user.name ?? "Unknown"}</span>{" "}
                  <span className="text-muted-foreground">{auditActionLabels[log.action] ?? log.action}</span>
                </p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatRelativeTime(log.createdAt)}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
