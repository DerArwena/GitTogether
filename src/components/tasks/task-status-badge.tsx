"use client"

import type { TaskStatus } from "@/generated/prisma/enums"

const statusConfig: Record<TaskStatus, { label: string; color: string }> = {
  backlog: { label: "Backlog", color: "bg-gray-500/15 text-gray-600 dark:text-gray-400" },
  todo: { label: "Todo", color: "bg-blue-500/15 text-blue-600 dark:text-blue-400" },
  in_progress: { label: "In Progress", color: "bg-amber-500/15 text-amber-600 dark:text-amber-400" },
  in_review: { label: "In Review", color: "bg-purple-500/15 text-purple-600 dark:text-purple-400" },
  done: { label: "Done", color: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" },
  cancelled: { label: "Cancelled", color: "bg-red-500/15 text-red-600 dark:text-red-400" },
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const cfg = statusConfig[status]
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium ${cfg.color}`}>
      <span className="size-1.5 rounded-full currentColor opacity-60" />
      {cfg.label}
    </span>
  )
}
