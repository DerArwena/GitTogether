"use client"

import { useState } from "react"
import { TaskStatusBadge } from "./task-status-badge"
import { TaskPriorityBadge } from "./task-priority-badge"
import { MessageSquare, Paperclip } from "lucide-react"

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

export function TaskCard({ task, onSelect }: { task: Task; onSelect: (id: string) => void }) {
  const doneSubtasks = task.subtasks?.filter((s) => s.status === "done").length ?? 0
  const totalSubtasks = task.subtasks?.length ?? 0

  return (
    <button
      onClick={() => onSelect(task.id)}
      className="w-full text-left rounded-lg border border-border bg-card p-3 hover:border-foreground/20 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-medium leading-snug line-clamp-2">{task.title}</p>
        <TaskPriorityBadge priority={task.priority as any} />
      </div>
      <div className="flex items-center gap-2 flex-wrap mb-2">
        {task.labels?.map((l) => (
          <span
            key={l.label.id}
            className="inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium"
            style={{ backgroundColor: `${l.label.color}20`, color: l.label.color }}
          >
            {l.label.name}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between gap-2">
        <TaskStatusBadge status={task.status as any} />
        <div className="flex items-center gap-2 text-muted-foreground">
          {totalSubtasks > 0 && (
            <span className="text-[11px] flex items-center gap-0.5">
              <Paperclip className="size-3" />
              {doneSubtasks}/{totalSubtasks}
            </span>
          )}
          {task.comments && task.comments.length > 0 && (
            <span className="text-[11px] flex items-center gap-0.5">
              <MessageSquare className="size-3" />
              {task.comments.length}
            </span>
          )}
          {task.assignee && (
            <div className="flex size-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground overflow-hidden shrink-0">
              {task.assignee.image ? (
                <img src={task.assignee.image} alt="" className="size-full object-cover" />
              ) : (
                task.assignee.name?.[0] ?? "?"
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  )
}
