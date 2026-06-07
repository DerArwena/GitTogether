"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { ok, fail } from "@/lib/actions"

export async function getProjectAuditLogs(projectId: string, limit = 50, offset = 0) {
  const session = await auth()
  if (!session?.user) return fail("Not authenticated")

  const logs = await db.auditLog.findMany({
    where: { projectId },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  })

  const total = await db.auditLog.count({ where: { projectId } })
  return ok({ logs, total })
}

export async function getUserAuditLogs(limit = 20, offset = 0) {
  const session = await auth()
  if (!session?.user) return fail("Not authenticated")

  const memberships = await db.projectMember.findMany({
    where: { userId: session.user.id },
    select: { projectId: true },
  })
  const projectIds = memberships.map((m) => m.projectId)

  const logs = await db.auditLog.findMany({
    where: { projectId: { in: projectIds } },
    include: {
      user: { select: { id: true, name: true, image: true } },
      project: { select: { name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: offset,
  })

  const total = await db.auditLog.count({
    where: { projectId: { in: projectIds } },
  })
  return ok({ logs, total })
}


