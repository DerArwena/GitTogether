"use client"

import { useState } from "react"
import { TaskCard } from "./task-card"
import { TaskDetailDrawer } from "./task-detail-drawer"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO } from "date-fns"
import { Button } from "@/components/ui/button"

interface Task {
  id: string
  title: string
  status: string
  priority: string
  assignee?: { id: string; name: string | null; image: string | null } | null
  labels?: { label: { id: string; name: string; color: string } }[]
  dueDate?: string | null
}

export function TaskRoadmap({ tasks }: { tasks: Task[] }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const withDueDate = tasks.filter((t) => t.dueDate)
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const monthTasks = withDueDate.filter((t) => {
    const d = parseISO(t.dueDate!)
    return isSameMonth(d, currentMonth)
  })

  const groupedByDay = days.reduce(
    (acc, day) => {
      const key = format(day, "yyyy-MM-dd")
      acc[key] = monthTasks.filter((t) => isSameDay(parseISO(t.dueDate!), day))
      return acc
    },
    {} as Record<string, Task[]>
  )

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">{format(currentMonth, "MMMM yyyy")}</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon-xs" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="size-3.5" />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px rounded-xl border border-border bg-border overflow-hidden">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="bg-muted/50 px-2 py-1.5 text-[11px] font-medium text-muted-foreground text-center">
            {d}
          </div>
        ))}
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd")
          const dayTasks = groupedByDay[key] || []
          return (
            <div
              key={key}
              className={`bg-card min-h-[90px] p-1.5 ${
                isToday(day) ? "ring-1 ring-inset ring-chart-1/30" : ""
              }`}
            >
              <span className={`text-[11px] font-medium ${isToday(day) ? "text-chart-1" : "text-muted-foreground"}`}>
                {format(day, "d")}
              </span>
              <div className="mt-1 space-y-0.5">
                {dayTasks.slice(0, 3).map((task) => (
                  <button
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    className="w-full text-left truncate rounded px-1 py-0.5 text-[10px] font-medium bg-chart-1/10 text-chart-1 hover:bg-chart-1/20 transition-colors"
                  >
                    {task.title}
                  </button>
                ))}
                {dayTasks.length > 3 && (
                  <p className="text-[10px] text-muted-foreground px-1">+{dayTasks.length - 3} more</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {selectedTaskId && (
        <TaskDetailDrawer
          taskId={selectedTaskId}
          open={!!selectedTaskId}
          projectId="" onClose={() => setSelectedTaskId(null)}        />
      )}
    </>
  )
}
