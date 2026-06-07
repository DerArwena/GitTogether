import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { TaskBoard } from "@/components/tasks/task-board"
import { TaskList } from "@/components/tasks/task-list"
import { TaskRoadmap } from "@/components/tasks/task-roadmap"
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog"
import { PageHeader } from "@/components/layout/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ArrowLeft, LayoutGrid, List, Map } from "lucide-react"

export default async function ProjectTasksPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await auth()
  if (!session?.user) redirect("/auth/signin")

  const project = await db.project.findUnique({ where: { slug } })
  if (!project) notFound()

  const tasks = await db.task.findMany({
    where: { projectId: project.id },
    include: {
      assignee: { select: { id: true, name: true, image: true } },
      creator: { select: { id: true, name: true, image: true } },
      labels: { include: { label: true } },
      comments: { select: { id: true } },
      subtasks: { select: { id: true, status: true } },
    },
    orderBy: { sortOrder: "asc" },
  })

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/projects/${slug}`}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors"
          >
            <ArrowLeft className="size-3" />
            Back to project
          </Link>
          <PageHeader title="Tasks" description={`${tasks.length} tasks in ${project.name}`} />
        </div>
        <CreateTaskDialog projectId={project.id} />
      </div>

      <Tabs defaultValue="board">
        <TabsList>
          <TabsTrigger value="board" className="gap-1.5"><LayoutGrid className="size-3.5" /> Board</TabsTrigger>
          <TabsTrigger value="list" className="gap-1.5"><List className="size-3.5" /> List</TabsTrigger>
          <TabsTrigger value="roadmap" className="gap-1.5"><Map className="size-3.5" /> Roadmap</TabsTrigger>
        </TabsList>
        <TabsContent value="board" className="mt-4">
          <TaskBoard tasks={JSON.parse(JSON.stringify(tasks))} projectId={project.id} />
        </TabsContent>
        <TabsContent value="list" className="mt-4">
          <TaskList tasks={JSON.parse(JSON.stringify(tasks))} projectId={project.id} />
        </TabsContent>
        <TabsContent value="roadmap" className="mt-4">
          <TaskRoadmap tasks={JSON.parse(JSON.stringify(tasks))} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
