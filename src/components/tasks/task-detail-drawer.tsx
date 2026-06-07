"use client"

import { useState, useEffect } from "react"
import { getTask, updateTask, addTaskComment, deleteTaskComment, getProjectMembers } from "@/server/actions/task"
import { getTaskChatRoom } from "@/server/actions/chat"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { TaskStatusBadge } from "./task-status-badge"
import { TaskPriorityBadge } from "./task-priority-badge"
import { TaskLabelPicker } from "./task-label-picker"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Calendar,
  MessageSquare,
  User,
  Send,
  Trash2,
  ChevronRight,
  Plus,
  MessageCircle,
  ExternalLink,
  MoreHorizontal,
  X,
  Check,
  Pencil,
} from "lucide-react"
import type { TaskStatus, TaskPriority } from "@/generated/prisma/enums"

export function TaskDetailDrawer({
  taskId,
  projectId,
  open,
  onClose,
}: {
  taskId: string
  projectId: string
  open: boolean
  onClose: () => void
}) {
  const [task, setTask] = useState<any>(null)
  const [members, setMembers] = useState<any[]>([])
  const [comment, setComment] = useState("")
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState("")
  const [chatRoomId, setChatRoomId] = useState<string | null>(null)
  const [showLabelPicker, setShowLabelPicker] = useState(false)

  useEffect(() => {
    if (!open || !taskId) return
    loadTask()
    loadMembers()
  }, [taskId, open])

  async function loadTask() {
    const res = await getTask(taskId)
    if (res.success && res.data) setTask(res.data)
  }

  async function loadMembers() {
    if (!projectId) return
    const res = await getProjectMembers(projectId)
    if (res.success && res.data) setMembers(res.data)
  }

  async function handleStatusChange(status: TaskStatus) {
    const fd = new FormData()
    fd.set("status", status)
    await updateTask(taskId, fd)
    loadTask()
  }

  async function handlePriorityChange(priority: TaskPriority) {
    const fd = new FormData()
    fd.set("priority", priority)
    await updateTask(taskId, fd)
    loadTask()
  }

  async function handleAssigneeChange(assigneeId: string) {
    const fd = new FormData()
    fd.set("assigneeId", assigneeId || "")
    await updateTask(taskId, fd)
    loadTask()
  }

  async function handleSaveTitle() {
    if (!titleDraft.trim()) return
    const fd = new FormData()
    fd.set("title", titleDraft.trim())
    await updateTask(taskId, fd)
    setEditingTitle(false)
    loadTask()
  }

  async function handleAddComment() {
    if (!comment.trim()) return
    const fd = new FormData()
    fd.set("content", comment)
    await addTaskComment(taskId, fd)
    setComment("")
    loadTask()
  }

  async function handleDeleteComment(commentId: string) {
    await deleteTaskComment(commentId)
    loadTask()
  }

  async function handleOpenChat() {
    const res = await getTaskChatRoom(taskId)
    if (res.success && res.data) setChatRoomId(res.data.id)
  }

  const doneSubtasks = task?.subtasks?.filter((s: any) => s.status === "done").length ?? 0
  const totalSubtasks = task?.subtasks?.length ?? 0
  const selectedLabelIds = task?.labels?.map((l: any) => l.label.id) ?? []

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <SheetContent side="right" className="w-full sm:max-w-[500px] p-0 flex flex-col">
        {task && (
          <>
            <SheetHeader className="px-4 py-3 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <TaskStatusBadge status={task.status} />
                <TaskPriorityBadge priority={task.priority} />
              </div>
              <SheetTitle className="text-base mt-1">
                {editingTitle ? (
                  <div className="flex items-center gap-1">
                    <Input
                      value={titleDraft}
                      onChange={(e) => setTitleDraft(e.target.value)}
                      className="h-7 text-sm"
                      onKeyDown={(e) => e.key === "Enter" && handleSaveTitle()}
                      autoFocus
                    />
                    <Button size="icon-xs" variant="ghost" onClick={handleSaveTitle}><Check className="size-3" /></Button>
                    <Button size="icon-xs" variant="ghost" onClick={() => setEditingTitle(false)}><X className="size-3" /></Button>
                  </div>
                ) : (
                  <button onClick={() => { setTitleDraft(task.title); setEditingTitle(true) }} className="hover:text-muted-foreground text-left">
                    {task.title}
                  </button>
                )}
              </SheetTitle>
              {task.parent && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ChevronRight className="size-3" />
                  <span className="truncate">{task.parent.title}</span>
                  <TaskStatusBadge status={task.parent.status} />
                </div>
              )}
            </SheetHeader>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {task.description && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Description</h4>
                  <p className="text-sm whitespace-pre-wrap">{task.description}</p>
                </div>
              )}

              {totalSubtasks > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Subtasks ({doneSubtasks}/{totalSubtasks})
                  </h4>
                  <div className="space-y-1">
                    {task.subtasks.map((sub: any) => (
                      <div key={sub.id} className="flex items-center gap-2 text-sm p-1.5 rounded hover:bg-muted/50">
                        <div
                          className={`size-3.5 rounded border cursor-pointer shrink-0 flex items-center justify-center transition-colors ${
                            sub.status === "done" ? "bg-emerald-500 border-emerald-500" : "border-border"
                          }`}
                          onClick={() => handleStatusChange(sub.status === "done" ? "todo" : "done")}
                        >
                          {sub.status === "done" && <Check className="size-2.5 text-white" />}
                        </div>
                        <span className={sub.status === "done" ? "line-through text-muted-foreground" : ""}>
                          {sub.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Details</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <User className="size-3.5" /> Assignee
                    </span>
                    <select
                      value={task.assignee?.id ?? ""}
                      onChange={(e) => handleAssigneeChange(e.target.value)}
                      className="text-right bg-transparent border-none text-sm focus:outline-none cursor-pointer hover:text-foreground"
                    >
                      <option value="">Unassigned</option>
                      {members.map((m: any) => (
                        <option key={m.user.id} value={m.user.id}>
                          {m.user.name ?? m.user.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="size-3.5" /> Due date
                    </span>
                    <input
                      type="date"
                      value={task.dueDate ? task.dueDate.split("T")[0] : ""}
                      onChange={(e) => {
                        const fd = new FormData()
                        fd.set("dueDate", e.target.value || "")
                        updateTask(taskId, fd).then(loadTask)
                      }}
                      className="text-right bg-transparent border-none text-sm focus:outline-none cursor-pointer"
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <MessageSquare className="size-3.5" /> Created by
                    </span>
                    <span className="text-foreground">{task.creator.name ?? "Unknown"}</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Labels</h4>
                  <Button variant="ghost" size="xs" onClick={() => setShowLabelPicker(!showLabelPicker)}>
                    <Plus className="size-3" />
                  </Button>
                </div>
                {showLabelPicker && (
                  <div className="mb-2 rounded-lg border border-border">
                    <TaskLabelPicker
                      taskId={taskId}
                      projectId={projectId}
                      selected={selectedLabelIds}
                      onClose={() => setShowLabelPicker(false)}
                    />
                  </div>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {task.labels?.map((l: any) => (
                    <span
                      key={l.label.id}
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium"
                      style={{ backgroundColor: `${l.label.color}20`, color: l.label.color }}
                    >
                      {l.label.name}
                    </span>
                  ))}
                  {task.labels?.length === 0 && (
                    <p className="text-xs text-muted-foreground">No labels</p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <MessageCircle className="size-3.5" /> Comments ({task.comments?.length ?? 0})
                  </h4>
                  <Button variant="ghost" size="xs" onClick={handleOpenChat}>
                    <MessageCircle className="size-3" /> Chat
                  </Button>
                </div>
                <div className="space-y-3">
                  {task.comments?.map((c: any) => (
                    <div key={c.id} className="flex gap-2.5">
                      <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground overflow-hidden">
                        {c.user.image ? (
                          <img src={c.user.image} alt="" className="size-full object-cover" />
                        ) : (
                          c.user.name?.[0] ?? "?"
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">{c.user.name}</span>
                          <span className="text-[10px] text-muted-foreground">{new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm mt-0.5">{c.content}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 pt-1">
                    <Input
                      placeholder="Write a comment..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="h-8 text-sm"
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleAddComment()}
                    />
                    <Button size="icon-sm" variant="ghost" onClick={handleAddComment}>
                      <Send className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
