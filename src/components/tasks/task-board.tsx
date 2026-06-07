"use client"

import { useState, useCallback } from "react"
import { TaskCard } from "./task-card"
import { TaskDetailDrawer } from "./task-detail-drawer"
import { updateTaskStatus } from "@/server/actions/task"
import type { TaskStatus } from "@/generated/prisma/enums"

const columns: { status: TaskStatus; label: string }[] = [
  { status: "backlog", label: "Backlog" },
  { status: "todo", label: "Todo" },
  { status: "in_progress", label: "In Progress" },
  { status: "in_review", label: "In Review" },
  { status: "done", label: "Done" },
]

interface Task {
  id: string
  title: string
  status: string
  priority: string
  assignee?: { id: string; name: string | null; image: string | null } | null
  creator?: { id: string; name: string | null; image: string | null } | null
  labels?: { label: { id: string; name: string; color: string } }[]
  comments?: { id: string }[]
  subtasks?: { id: string; status: string }[]
  dueDate?: string | null
  description?: string | null
  parent?: { id: string; title: string; status: string } | null
}

export function TaskBoard({ tasks, projectId }: { tasks: Task[]; projectId: string }) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<string | null>(null)

  const handleDrop = useCallback(async (taskId: string, newStatus: TaskStatus) => {
    await updateTaskStatus(taskId, newStatus)
  }, [])

  const grouped = columns.reduce(
    (acc, col) => {
      acc[col.status] = tasks.filter((t) => t.status === col.status)
      return acc
    },
    {} as Record<string, Task[]>
  )

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-4 min-h-[60vh]">
        {columns.map((col) => {
          const colTasks = grouped[col.status] || []
          return (
            <div
              key={col.status}
              className={`flex-1 min-w-[260px] max-w-[320px] rounded-xl border border-border bg-muted/30 p-3 transition-colors ${
                dragOverCol === col.status ? "border-chart-1" : ""
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.status) }}
              onDragLeave={() => setDragOverCol(null)}
              onDrop={(e) => {
                e.preventDefault()
                const taskId = e.dataTransfer.getData("taskId")
                if (taskId) handleDrop(taskId, col.status as TaskStatus)
                setDragOverCol(null)
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {col.label}
                </h3>
                <span className="text-[11px] text-muted-foreground bg-muted rounded px-1.5 py-0.5">
                  {colTasks.length}
                </span>
              </div>
              <div className="space-y-2">
                {colTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("taskId", task.id)}
                  >
                    <TaskCard task={task} onSelect={setSelectedTaskId} />
                  </div>
                ))}
                {colTasks.length === 0 && (
                  <p className="text-[11px] text-muted-foreground text-center py-6">No tasks</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {selectedTaskId && (
        <TaskDetailDrawer
          taskId={selectedTaskId}
          projectId={projectId}
          open={!!selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}
    </>
  )
}
