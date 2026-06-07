"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { ok, fail } from "@/lib/actions"
import type { TaskStatus, TaskPriority } from "@/generated/prisma/enums"

export async function getProjectTasks(projectId: string) {
  const session = await auth()
  if (!session?.user) return fail("Not authenticated")

  const tasks = await db.task.findMany({
    where: { projectId },
    include: {
      assignee: { select: { id: true, name: true, image: true } },
      creator: { select: { id: true, name: true, image: true } },
      labels: { include: { label: true } },
      comments: { select: { id: true } },
      subtasks: { select: { id: true, status: true } },
    },
    orderBy: { sortOrder: "asc" },
  })

  return ok(tasks)
}

export async function getTask(taskId: string) {
  const session = await auth()
  if (!session?.user) return fail("Not authenticated")

  const task = await db.task.findUnique({
    where: { id: taskId },
    include: {
      assignee: { select: { id: true, name: true, image: true, email: true } },
      creator: { select: { id: true, name: true, image: true } },
      labels: { include: { label: true } },
      comments: {
        include: {
          user: { select: { id: true, name: true, image: true } },
        },
        orderBy: { createdAt: "asc" },
      },
      subtasks: {
        include: {
          assignee: { select: { id: true, name: true, image: true } },
          labels: { include: { label: true } },
        },
        orderBy: { sortOrder: "asc" },
      },
      parent: { select: { id: true, title: true, status: true } },
    },
  })

  if (!task) return fail("Task not found")
  return ok(task)
}

export async function createTask(formData: FormData) {
  const session = await auth()
  if (!session?.user) return fail("Not authenticated")

  const projectId = formData.get("projectId") as string
  const title = formData.get("title") as string
  const description = formData.get("description") as string | null
  const status = (formData.get("status") as TaskStatus) || "backlog"
  const priority = (formData.get("priority") as TaskPriority) || "none"
  const assigneeId = formData.get("assigneeId") as string | null
  const parentId = formData.get("parentId") as string | null
  const dueDate = formData.get("dueDate") as string | null

  if (!title?.trim()) return fail("Title is required")

  const maxSort = await db.task.aggregate({
    where: { projectId, status },
    _max: { sortOrder: true },
  })

  const task = await db.task.create({
    data: {
      projectId,
      title: title.trim(),
      description: description?.trim() || null,
      status,
      priority: priority || "none",
      assigneeId: assigneeId || null,
      parentId: parentId || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      sortOrder: (maxSort._max.sortOrder ?? 0) + 1,
      createdById: session.user.id,
    },
  })

  await db.auditLog.create({
    data: {
      projectId,
      userId: session.user.id,
      action: "task_created",
      entityType: "task",
      entityId: task.id,
      metadata: { title: task.title, status: task.status },
    },
  })

  revalidatePath(`/projects/${projectId}/tasks`)
  return ok(task)
}

export async function updateTask(taskId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user) return fail("Not authenticated")

  const existing = await db.task.findUnique({ where: { id: taskId } })
  if (!existing) return fail("Task not found")

  const title = formData.get("title") as string | null
  const description = formData.get("description") as string | null
  const status = formData.get("status") as TaskStatus | null
  const priority = formData.get("priority") as TaskPriority | null
  const assigneeId = formData.get("assigneeId") as string | null
  const dueDate = formData.get("dueDate") as string | null
  const sortOrder = formData.get("sortOrder") as string | null

  const data: Record<string, unknown> = {}
  if (title?.trim()) data.title = title.trim()
  if (description !== null) data.description = description.trim() || null
  if (status) data.status = status
  if (priority) data.priority = priority
  if (assigneeId !== null) data.assigneeId = assigneeId || null
  if (dueDate !== null) data.dueDate = dueDate ? new Date(dueDate) : null
  if (sortOrder !== null) data.sortOrder = parseFloat(sortOrder)

  const task = await db.task.update({
    where: { id: taskId },
    data,
  })

  const auditAction = status && status !== existing.status ? "task_status_changed"
    : assigneeId && assigneeId !== existing.assigneeId ? "task_assigned"
    : "task_updated"

  await db.auditLog.create({
    data: {
      projectId: task.projectId,
      userId: session.user.id,
      action: auditAction,
      entityType: "task",
      entityId: task.id,
      metadata: { changes: Object.keys(data) },
    },
  })

  revalidatePath(`/projects/${task.projectId}/tasks`)
  return ok(task)
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const session = await auth()
  if (!session?.user) return fail("Not authenticated")

  const task = await db.task.update({
    where: { id: taskId },
    data: { status },
  })

  await db.auditLog.create({
    data: {
      projectId: task.projectId,
      userId: session.user.id,
      action: "task_status_changed",
      entityType: "task",
      entityId: task.id,
      metadata: { from: task.status, to: status },
    },
  })

  revalidatePath(`/projects/${task.projectId}/tasks`)
  return ok(task)
}

export async function deleteTask(taskId: string) {
  const session = await auth()
  if (!session?.user) return fail("Not authenticated")

  const task = await db.task.findUnique({ where: { id: taskId } })
  if (!task) return fail("Task not found")

  await db.task.delete({ where: { id: taskId } })

  await db.auditLog.create({
    data: {
      projectId: task.projectId,
      userId: session.user.id,
      action: "task_deleted",
      entityType: "task",
      entityId: taskId,
      metadata: { title: task.title },
    },
  })

  revalidatePath(`/projects/${task.projectId}/tasks`)
  return ok(null)
}

export async function reorderTasks(updates: { id: string; sortOrder: number; status?: TaskStatus }[]) {
  const session = await auth()
  if (!session?.user) return fail("Not authenticated")

  for (const update of updates) {
    await db.task.update({
      where: { id: update.id },
      data: {
        sortOrder: update.sortOrder,
        ...(update.status ? { status: update.status } : {}),
      },
    })
  }

  return ok(null)
}

export async function addTaskComment(taskId: string, formData: FormData) {
  const session = await auth()
  if (!session?.user) return fail("Not authenticated")

  const content = formData.get("content") as string
  if (!content?.trim()) return fail("Comment is required")

  const task = await db.task.findUnique({ where: { id: taskId } })
  if (!task) return fail("Task not found")

  const comment = await db.taskComment.create({
    data: {
      taskId,
      userId: session.user.id,
      content: content.trim(),
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  })

  revalidatePath(`/projects/${task.projectId}/tasks`)
  return ok(comment)
}

export async function deleteTaskComment(commentId: string) {
  const session = await auth()
  if (!session?.user) return fail("Not authenticated")

  await db.taskComment.delete({ where: { id: commentId } })
  return ok(null)
}

export async function getProjectLabels(projectId: string) {
  const labels = await db.taskLabel.findMany({
    where: { projectId },
    orderBy: { name: "asc" },
  })
  return ok(labels)
}

export async function createTaskLabel(formData: FormData) {
  const session = await auth()
  if (!session?.user) return fail("Not authenticated")

  const projectId = formData.get("projectId") as string
  const name = formData.get("name") as string
  const color = (formData.get("color") as string) || "#6366f1"

  if (!name?.trim()) return fail("Label name is required")

  const label = await db.taskLabel.create({
    data: { projectId, name: name.trim(), color },
  })

  revalidatePath(`/projects/${projectId}/tasks`)
  return ok(label)
}

export async function deleteTaskLabel(labelId: string) {
  const session = await auth()
  if (!session?.user) return fail("Not authenticated")

  await db.taskLabel.delete({ where: { id: labelId } })
  return ok(null)
}

export async function toggleTaskLabel(taskId: string, labelId: string) {
  const session = await auth()
  if (!session?.user) return fail("Not authenticated")

  const existing = await db.taskToLabel.findUnique({
    where: { taskId_labelId: { taskId, labelId } },
  })

  if (existing) {
    await db.taskToLabel.delete({
      where: { taskId_labelId: { taskId, labelId } },
    })
  } else {
    await db.taskToLabel.create({ data: { taskId, labelId } })
  }

  return ok(null)
}

export async function getProjectMembers(projectId: string) {
  const members = await db.projectMember.findMany({
    where: { projectId },
    include: {
      user: { select: { id: true, name: true, image: true, email: true } },
    },
  })
  return ok(members)
}
