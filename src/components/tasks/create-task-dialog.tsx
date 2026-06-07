"use client"

import { useState, useEffect } from "react"
import { createTask, getProjectMembers, getProjectLabels } from "@/server/actions/task"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus } from "lucide-react"
import type { TaskStatus, TaskPriority } from "@/generated/prisma/enums"

export function CreateTaskDialog({ projectId, parentId, status = "backlog", onCreated }: {
  projectId: string
  parentId?: string
  status?: TaskStatus
  onCreated?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [members, setMembers] = useState<any[]>([])

  useEffect(() => {
    if (open) {
      getProjectMembers(projectId).then((r) => { if (r.success && r.data) setMembers(r.data) })
    }
  }, [open, projectId])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    fd.set("projectId", projectId)
    if (parentId) fd.set("parentId", parentId)
    fd.set("status", status)
    const res = await createTask(fd)
    if (res.success) {
      setOpen(false)
      onCreated?.()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="default" size="sm" className="gap-1.5" />}>
        <Plus className="size-3.5" />
        Add task
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create task</DialogTitle>
          <DialogDescription>Add a new task to this project.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium block mb-1">Title</label>
            <Input name="title" required placeholder="Task title..." />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">Description</label>
            <textarea
              name="description" rows={3}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none"
              placeholder="Optional description..."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1">Priority</label>
              <select name="priority" className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="none">None</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1">Assignee</label>
              <select name="assigneeId" className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="">Unassigned</option>
                {members.map((m: any) => (
                  <option key={m.user.id} value={m.user.id}>{m.user.name ?? m.user.email}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1">Due date</label>
            <Input name="dueDate" type="date" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <DialogClose render={<Button variant="outline" size="sm" />}>Cancel</DialogClose>
            <Button type="submit" size="sm">Create</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
