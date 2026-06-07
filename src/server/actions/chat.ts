"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { ok, fail } from "@/lib/actions"

export async function getOrCreateWorkspaceChat() {
  const session = await auth()
  if (!session?.user) return fail("Not authenticated")

  let room = await db.chatRoom.findFirst({
    where: { type: "workspace" },
    include: {
      messages: {
        include: {
          user: { select: { id: true, name: true, image: true } },
          mentions: { include: { user: { select: { id: true, name: true } } } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      readReceipts: { where: { userId: session.user.id } },
    },
  })

  if (!room) {
    room = await db.chatRoom.create({
      data: {
        type: "workspace",
        name: "Workspace Chat",
        createdById: session.user.id,
      },
      include: {
        messages: {
          include: {
            user: { select: { id: true, name: true, image: true } },
            mentions: { include: { user: { select: { id: true, name: true } } } },
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        readReceipts: { where: { userId: session.user.id } },
      },
    })
  }

  return ok(room)
}

export async function getProjectChatRoom(projectId: string) {
  const session = await auth()
  if (!session?.user) return fail("Not authenticated")

  let room = await db.chatRoom.findFirst({
    where: { projectId, type: "project" },
    include: {
      messages: {
        include: {
          user: { select: { id: true, name: true, image: true } },
          mentions: { include: { user: { select: { id: true, name: true } } } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      readReceipts: { where: { userId: session.user.id } },
    },
  })

  if (!room) {
    const project = await db.project.findUnique({ where: { id: projectId } })
    if (!project) return fail("Project not found")

    room = await db.chatRoom.create({
      data: {
        projectId,
        type: "project",
        name: `${project.name} Chat`,
        createdById: session.user.id,
      },
      include: {
        messages: {
          include: {
            user: { select: { id: true, name: true, image: true } },
            mentions: { include: { user: { select: { id: true, name: true } } } },
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        readReceipts: { where: { userId: session.user.id } },
      },
    })
  }

  return ok(room)
}

export async function getTaskChatRoom(taskId: string) {
  const session = await auth()
  if (!session?.user) return fail("Not authenticated")

  const task = await db.task.findUnique({
    where: { id: taskId },
    select: { projectId: true },
  })
  if (!task) return fail("Task not found")

  let room = await db.chatRoom.findFirst({
    where: { taskId, type: "task" },
    include: {
      messages: {
        include: {
          user: { select: { id: true, name: true, image: true } },
          mentions: { include: { user: { select: { id: true, name: true } } } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      readReceipts: { where: { userId: session.user.id } },
    },
  })

  if (!room) {
    room = await db.chatRoom.create({
      data: {
        projectId: task.projectId,
        taskId,
        type: "task",
        name: `Task #${taskId.slice(0, 8)}`,
        createdById: session.user.id,
      },
      include: {
        messages: {
          include: {
            user: { select: { id: true, name: true, image: true } },
            mentions: { include: { user: { select: { id: true, name: true } } } },
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        readReceipts: { where: { userId: session.user.id } },
      },
    })
  }

  return ok(room)
}

export async function sendMessage(formData: FormData) {
  const session = await auth()
  if (!session?.user) return fail("Not authenticated")

  const roomId = formData.get("roomId") as string
  const content = formData.get("content") as string

  if (!content?.trim()) return fail("Message is required")

  const room = await db.chatRoom.findUnique({ where: { id: roomId } })
  if (!room) return fail("Room not found")

  const mentioned = new Set<string>()
  const mentionRegex = /@(\S+)/g
  let match
  while ((match = mentionRegex.exec(content)) !== null) {
    const user = await db.user.findFirst({
      where: { name: { equals: match[1], mode: "insensitive" } },
      select: { id: true },
    })
    if (user) mentioned.add(user.id)
  }

  const message = await db.chatMessage.create({
    data: {
      roomId,
      userId: session.user.id,
      content: content.trim(),
      mentions: {
        create: Array.from(mentioned).map((userId) => ({ userId })),
      },
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
      mentions: { include: { user: { select: { id: true, name: true } } } },
    },
  })

  if (room.projectId) {
    await db.auditLog.create({
      data: {
        projectId: room.projectId,
        userId: session.user.id,
        action: "chat_message_sent",
        entityType: "chat_message",
        entityId: message.id,
        metadata: { roomId, roomType: room.type },
      },
    })
  }

  const path = room.projectId ? `/projects/${room.projectId}/chat` : "/chat"
  revalidatePath(path)
  return ok(message)
}

export async function getChatRooms() {
  const session = await auth()
  if (!session?.user) return fail("Not authenticated")

  const memberships = await db.projectMember.findMany({
    where: { userId: session.user.id },
    select: { projectId: true },
  })

  const projectIds = memberships.map((m) => m.projectId)

  const rooms = await db.chatRoom.findMany({
    where: {
      OR: [
        { type: "workspace" },
        { projectId: { in: projectIds }, type: "project" },
      ],
    },
    include: {
      _count: { select: { messages: true } },
      readReceipts: {
        where: { userId: session.user.id },
        select: { lastReadAt: true },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          content: true,
          createdAt: true,
          user: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return ok(rooms)
}

export async function getUnreadCounts() {
  const session = await auth()
  if (!session?.user) return fail("Not authenticated")

  const memberships = await db.projectMember.findMany({
    where: { userId: session.user.id },
    select: { projectId: true },
  })

  const projectIds = memberships.map((m) => m.projectId)

  const rooms = await db.chatRoom.findMany({
    where: {
      OR: [
        { type: "workspace" },
        { projectId: { in: projectIds }, type: "project" },
      ],
    },
    select: {
      id: true,
      _count: { select: { messages: true } },
      readReceipts: {
        where: { userId: session.user.id },
        select: { lastReadAt: true },
      },
    },
  })

  const unreadMap: Record<string, number> = {}
  for (const room of rooms) {
    const lastRead = room.readReceipts[0]?.lastReadAt
    if (!lastRead) {
      unreadMap[room.id] = room._count.messages
    } else {
      const unread = await db.chatMessage.count({
        where: {
          roomId: room.id,
          createdAt: { gt: lastRead },
        },
      })
      unreadMap[room.id] = unread
    }
  }

  const totalUnread = Object.values(unreadMap).reduce((a, b) => a + b, 0)
  return ok({ rooms: unreadMap, total: totalUnread })
}

export async function markRoomRead(roomId: string) {
  const session = await auth()
  if (!session?.user) return fail("Not authenticated")

  await db.chatReadReceipt.upsert({
    where: { roomId_userId: { roomId, userId: session.user.id } },
    update: { lastReadAt: new Date() },
    create: { roomId, userId: session.user.id },
  })

  return ok(null)
}

export async function getProjectChatRooms(projectId: string) {
  const session = await auth()
  if (!session?.user) return fail("Not authenticated")

  const rooms = await db.chatRoom.findMany({
    where: { projectId },
    include: {
      _count: { select: { messages: true } },
      readReceipts: {
        where: { userId: session.user.id },
        select: { lastReadAt: true },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          content: true,
          createdAt: true,
          user: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return ok(rooms)
}

export async function getChatMessages(roomId: string, offset = 0, limit = 50) {
  const session = await auth()
  if (!session?.user) return fail("Not authenticated")

  const messages = await db.chatMessage.findMany({
    where: { roomId },
    include: {
      user: { select: { id: true, name: true, image: true } },
      mentions: { include: { user: { select: { id: true, name: true } } } },
    },
    orderBy: { createdAt: "desc" },
    skip: offset,
    take: limit,
  })

  return ok(messages.reverse())
}
