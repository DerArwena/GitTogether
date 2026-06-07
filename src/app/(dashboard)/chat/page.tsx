import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { getOrCreateWorkspaceChat, getChatRooms } from "@/server/actions/chat"
import { WorkspaceChatClient } from "./client"

export default async function ChatPage() {
  const session = await auth()
  if (!session?.user) redirect("/auth/signin")

  const mainRoomRes = await getOrCreateWorkspaceChat()
  const roomsRes = await getChatRooms()
  const mainRoom = mainRoomRes.success ? mainRoomRes.data : null
  const rooms = roomsRes.success ? roomsRes.data : []

  return (
    <WorkspaceChatClient
      initialRooms={JSON.parse(JSON.stringify(rooms))}
      initialRoom={JSON.parse(JSON.stringify(mainRoom))}
      currentUserId={session.user.id}
    />
  )
}
