import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import Link from "next/link"
import {
  Plus,
  FolderKanban,
  GitFork,
  Users,
  ArrowRight,
  Activity,
  CheckSquare,
  MessageSquareText,
  TrendingUp,
  ArrowUpRight,
  AlertCircle,
  Clock,
  BarChart3,
  ExternalLink,
  LayoutList,
  MessageCircle,
} from "lucide-react"
import { PageHeader } from "@/components/layout/page-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatRelativeTime } from "@/lib/utils"

function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  href,
}: {
  label: string
  value: number | string
  icon: typeof FolderKanban
  trend?: string
  href?: string
}) {
  const inner = (
    <Card size="sm" className="hover:border-foreground/20 transition-colors">
      <CardContent className="px-4 py-3.5">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex size-6 items-center justify-center rounded bg-muted">
            <Icon className="size-3 text-muted-foreground" />
          </div>
          <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            {label}
          </span>
        </div>
        <div className="flex items-end justify-between">
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {trend && (
            <span className="flex items-center gap-0.5 text-[11px] text-emerald-500 font-medium">
              <TrendingUp className="size-3" />
              {trend}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return href ? <Link href={href}>{inner}</Link> : inner
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/signin")

  const memberships = await db.projectMember.findMany({
    where: { userId: session.user.id },
    include: {
      project: {
        include: {
          _count: { select: { members: true, linkedRepos: true } },
          owner: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const projectIds = memberships.map((m) => m.projectId)

  const [recentRequests, assignedTasks, unreadMentions, repoCounts] = await Promise.all([
    projectIds.length > 0
      ? db.joinRequest.findMany({
          where: { projectId: { in: projectIds }, status: "pending" },
          include: {
            user: { select: { name: true, email: true } },
            project: { select: { name: true, slug: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        })
      : Promise.resolve([]),
    db.task.findMany({
      where: {
        assigneeId: session.user.id,
        status: { notIn: ["done", "cancelled"] },
      },
      include: {
        project: { select: { name: true, slug: true } },
        labels: { include: { label: true } },
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
    }),
    db.chatMention.findMany({
      where: {
        userId: session.user.id,
        message: {
          createdAt: {
            gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      },
      include: {
        message: {
          include: {
            user: { select: { name: true, image: true } },
            room: { select: { name: true } },
          },
        },
      },
      orderBy: { message: { createdAt: "desc" } },
      take: 5,
    }),
    db.linkedRepo.groupBy({
      by: ["projectId"],
      _count: true,
      where: { projectId: { in: projectIds } },
    }),
  ])

  const totalRepos = memberships.reduce((s, m) => s + m.project._count.linkedRepos, 0)
  const totalMembers = memberships.reduce((s, m) => s + m.project._count.members, 0)
  const totalPending = recentRequests.length
  const tasksInProgress = assignedTasks.filter((t) => t.status === "in_progress" || t.status === "in_review").length

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title={`Welcome back, ${session.user.name ?? session.user.email}`}
        description="Here is what is happening across your projects."
        actions={
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-1.5 h-8 rounded-md bg-foreground px-3.5 text-xs font-medium text-background hover:bg-foreground/90 transition-all"
          >
            <Plus className="size-3.5" />
            New project
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        <StatCard label="Projects" value={memberships.length} icon={FolderKanban} href="/projects" />
        <StatCard label="Repositories" value={totalRepos} icon={GitFork} />
        <StatCard label="Team members" value={totalMembers} icon={Users} />
        <StatCard label="My tasks" value={assignedTasks.length} icon={CheckSquare} trend={tasksInProgress > 0 ? `${tasksInProgress} active` : undefined} />
        <StatCard label="Pending" value={totalPending} icon={Activity} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <CheckSquare className="size-4 text-muted-foreground" />
                My tasks
              </h2>
              {assignedTasks.length > 0 && (
                <Link href="/projects" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
                  View all <ArrowUpRight className="size-3" />
                </Link>
              )}
            </div>
            {assignedTasks.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <div className="flex justify-center mb-2">
                    <div className="flex size-8 items-center justify-center rounded bg-muted">
                      <CheckSquare className="size-4 text-muted-foreground" />
                    </div>
                  </div>
                  <p className="text-sm font-medium">No tasks assigned</p>
                  <p className="text-xs text-muted-foreground mt-1">Tasks assigned to you will appear here.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="rounded-xl border border-border bg-card divide-y divide-border">
                {assignedTasks.map((task) => (
                  <Link
                    key={task.id}
                    href={`/projects/${task.project.slug}/tasks`}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors group"
                  >
                    <div className={`size-2 rounded-full shrink-0 ${
                      task.status === "in_progress" ? "bg-amber-500" :
                      task.status === "in_review" ? "bg-purple-500" :
                      task.status === "todo" ? "bg-blue-500" :
                      "bg-gray-400"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{task.project.name}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {task.labels?.slice(0, 2).map((l) => (
                        <span key={l.label.id} className="text-[10px] rounded px-1 py-0.5" style={{ backgroundColor: `${l.label.color}20`, color: l.label.color }}>
                          {l.label.name}
                        </span>
                      ))}
                    </div>
                    <ArrowRight className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <FolderKanban className="size-4 text-muted-foreground" />
                Your projects
              </h2>
              {memberships.length > 0 && (
                <Link href="/projects" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
                  View all <ArrowUpRight className="size-3" />
                </Link>
              )}
            </div>

            {memberships.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="flex justify-center mb-3">
                    <div className="flex size-10 items-center justify-center rounded bg-muted">
                      <FolderKanban className="size-5 text-muted-foreground" />
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold">No projects yet</h3>
                  <p className="text-xs text-muted-foreground mt-1 mb-4 max-w-xs mx-auto">
                    Create your first project or accept an invite to get started.
                  </p>
                  <Link href="/projects/new" className="inline-flex items-center gap-1.5 h-7 rounded bg-foreground px-3 text-xs font-medium text-background hover:bg-foreground/90 transition-all">
                    <Plus className="size-3" /> Create project
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {memberships.slice(0, 6).map(({ project, role }) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.slug}`}
                    className="group rounded-lg border border-border bg-card p-4 hover:border-foreground/20 hover:shadow-sm transition-all duration-200 hover-lift"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-medium text-sm group-hover:text-foreground transition-colors">{project.name}</h3>
                      <span className="text-[10px] uppercase tracking-widest text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-medium">{role}</span>
                    </div>
                    {project.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2 leading-relaxed">{project.description}</p>
                    )}
                    <div className="flex gap-3 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="size-3" /> {project._count.members}</span>
                      <span className="flex items-center gap-1"><GitFork className="size-3" /> {project._count.linkedRepos}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {memberships.length > 6 && (
              <Link href="/projects" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-2">
                View all projects <ArrowRight className="size-3" />
              </Link>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {unreadMentions.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold flex items-center gap-2 mb-3">
                <MessageCircle className="size-4 text-muted-foreground" />
                Mentions
              </h2>
              <div className="rounded-lg border border-border bg-card divide-y divide-border">
                {unreadMentions.slice(0, 3).map((mention) => (
                  <Link key={mention.id} href="/chat" className="flex items-center gap-2.5 p-3 text-xs hover:bg-muted/30 transition-colors group">
                    <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-chart-1/10 text-chart-1 text-[10px] font-medium overflow-hidden">
                      {mention.message.user.image ? (
                        <img src={mention.message.user.image} alt="" className="size-full object-cover" />
                      ) : (
                        mention.message.user.name?.[0] ?? "?"
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p><span className="font-medium">{mention.message.user.name}</span> mentioned you in <span className="font-medium">{mention.message.room.name ?? "chat"}</span></p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <Activity className="size-4 text-muted-foreground" />
              Recent activity
            </h2>
            {recentRequests.length === 0 && memberships.length > 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <div className="flex justify-center mb-2">
                    <div className="flex size-8 items-center justify-center rounded bg-muted"><Activity className="size-4 text-muted-foreground" /></div>
                  </div>
                  <p className="text-xs text-muted-foreground">No pending activity.</p>
                </CardContent>
              </Card>
            ) : recentRequests.length === 0 ? null : (
              <div className="rounded-lg border border-border bg-card divide-y divide-border">
                {recentRequests.map((req) => (
                  <div key={req.id} className="p-3 text-xs hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="size-1.5 rounded-full bg-yellow-500 shrink-0" />
                      <span className="font-medium truncate">{req.user.name ?? req.user.email}</span>
                    </div>
                    <p className="text-muted-foreground">wants to join <span className="font-medium text-foreground">{req.project.name}</span></p>
                    <Link href={`/projects/${req.project.slug}/requests`} className="text-foreground hover:underline mt-1 inline-block text-[11px]">Review</Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <BarChart3 className="size-4 text-muted-foreground" />
              Quick actions
            </h2>
            <div className="space-y-1.5">
              <Link href="/projects/new" className="flex items-center gap-2.5 rounded-lg border border-border bg-card p-3 text-sm hover:bg-muted/50 transition-colors group">
                <div className="flex size-7 items-center justify-center rounded bg-muted group-hover:bg-foreground/10 transition-colors"><Plus className="size-3.5 text-muted-foreground" /></div>
                <span>New project</span>
                <ArrowRight className="size-3 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link href="/chat" className="flex items-center gap-2.5 rounded-lg border border-border bg-card p-3 text-sm hover:bg-muted/50 transition-colors group">
                <div className="flex size-7 items-center justify-center rounded bg-muted group-hover:bg-foreground/10 transition-colors"><MessageSquareText className="size-3.5 text-muted-foreground" /></div>
                <span>Open chat</span>
                <ArrowRight className="size-3 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link href="/activity" className="flex items-center gap-2.5 rounded-lg border border-border bg-card p-3 text-sm hover:bg-muted/50 transition-colors group">
                <div className="flex size-7 items-center justify-center rounded bg-muted group-hover:bg-foreground/10 transition-colors"><Activity className="size-3.5 text-muted-foreground" /></div>
                <span>View activity</span>
                <ArrowRight className="size-3 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link href="/admin" className="flex items-center gap-2.5 rounded-lg border border-border bg-card p-3 text-sm hover:bg-muted/50 transition-colors group">
                <div className="flex size-7 items-center justify-center rounded bg-muted group-hover:bg-foreground/10 transition-colors"><Users className="size-3.5 text-muted-foreground" /></div>
                <span>Manage team</span>
                <ArrowRight className="size-3 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
