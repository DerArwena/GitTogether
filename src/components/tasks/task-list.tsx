"use client"

import { useState } from "react"
import { TaskCard } from "./task-card"
import { TaskDetailDrawer } from "./task-detail-drawer"
import { TaskStatusBadge } from "./task-status-badge"
import { TaskPriorityBadge } from "./task-priority-badge"
import { Search, SlidersHorizontal, ArrowUpDown } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface Task {
  id: string
  title: string
  status: string
  priority: string
  assignee?: { id: string; name: string | null; image: string | null } | null
  labels?: { label: { id: string; name: string; color: string } }[]
  comments?: { id: string }[]
  subtasks?: { id: string; status: string }[]
  dueDate?: string | null
}

export function TaskList({ tasks, projectId }: { tasks: Task[]; projectId: string }) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filtered = tasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter !== "all" && t.status !== statusFilter) return false
    return true
  })

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-8 rounded-md border border-border bg-background px-2 text-xs text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">All statuses</option>
          <option value="backlog">Backlog</option>
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="in_review">In Review</option>
          <option value="done">Done</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="space-y-1.5">
        {filtered.map((task) => (
          <TaskCard key={task.id} task={task} onSelect={setSelectedTaskId} />
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-12">No tasks match your filters</p>
        )}
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
