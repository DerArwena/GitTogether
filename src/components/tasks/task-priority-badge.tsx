"use client"

import type { TaskPriority } from "@/generated/prisma/enums"
import { ArrowUp, ArrowDown, GripHorizontal } from "lucide-react"

const priorityConfig: Record<TaskPriority, { label: string; icon: typeof ArrowUp; color: string }> = {
  none: { label: "None", icon: GripHorizontal, color: "text-muted-foreground" },
  urgent: { label: "Urgent", icon: ArrowUp, color: "text-red-500" },
  high: { label: "High", icon: ArrowUp, color: "text-orange-500" },
  medium: { label: "Medium", icon: ArrowDown, color: "text-amber-500" },
  low: { label: "Low", icon: ArrowDown, color: "text-blue-500" },
}

export function TaskPriorityBadge({ priority }: { priority: TaskPriority }) {
  const cfg = priorityConfig[priority]
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${cfg.color}`}>
      <Icon className="size-3" />
      {cfg.label}
    </span>
  )
}
