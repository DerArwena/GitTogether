import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { notFound, redirect } from "next/navigation"
import { getProjectChatRoom, getProjectChatRooms } from "@/server/actions/chat"
import { ProjectChatClient } from "./client"

export default async function ProjectChatPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await auth()
  if (!session?.user) redirect("/auth/signin")

  const project = await db.project.findUnique({ where: { slug } })
  if (!project) notFound()

  const roomsRes = await getProjectChatRooms(project.id)
  const rooms = roomsRes.success ? roomsRes.data : []
  const mainRoomRes = await getProjectChatRoom(project.id)
  const mainRoom = mainRoomRes.success ? mainRoomRes.data : null

  return (
    <ProjectChatClient
      projectId={project.id}
      projectSlug={slug}
      projectName={project.name}
      initialRooms={JSON.parse(JSON.stringify(rooms))}
      initialRoom={JSON.parse(JSON.stringify(mainRoom))}
      currentUserId={session.user.id}
    />
  )
}
