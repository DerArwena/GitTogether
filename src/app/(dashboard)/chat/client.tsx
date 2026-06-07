"use client"

import { useState, useEffect } from "react"
import { ChatMessageList } from "@/components/chat/chat-message-list"
import { ChatInput } from "@/components/chat/chat-input"
import { ChatSidebar } from "@/components/chat/chat-sidebar"
import { getChatMessages, markRoomRead, getUnreadCounts } from "@/server/actions/chat"

export function WorkspaceChatClient({
  initialRooms,
  initialRoom,
  currentUserId,
}: {
  initialRooms: any[]
  initialRoom: any
  currentUserId: string
}) {
  const [rooms] = useState(initialRooms)
  const [activeRoom, setActiveRoom] = useState<any>(initialRoom)
  const [messages, setMessages] = useState<any[]>(initialRoom?.messages ?? [])
  const [unreadMap, setUnreadMap] = useState<Record<string, number>>({})

  useEffect(() => {
    getUnreadCounts().then((r) => {
      if (r.success && r.data) setUnreadMap(r.data.rooms)
    })
  }, [])

  useEffect(() => {
    if (activeRoom) {
      markRoomRead(activeRoom.id)
      loadMessages(activeRoom.id)
    }
  }, [activeRoom?.id])

  async function loadMessages(roomId: string) {
    const res = await getChatMessages(roomId)
    if (res.success && res.data) setMessages(res.data)
  }

  async function handleSelectRoom(room: any) {
    setActiveRoom(room)
    await markRoomRead(room.id)
    setUnreadMap((prev) => ({ ...prev, [room.id]: 0 }))
  }

  return (
    <div className="flex h-full">
      <ChatSidebar
        activeRoomId={activeRoom?.id}
        onSelectRoom={handleSelectRoom}
        rooms={rooms}
        unreadMap={unreadMap}
      />
      <div className="flex-1 flex flex-col">
        <div className="border-b border-border px-4 py-2.5">
          <h2 className="text-sm font-semibold">{activeRoom?.name ?? "Workspace Chat"}</h2>
        </div>
        <ChatMessageList messages={messages} currentUserId={currentUserId} />
        {activeRoom && <ChatInput roomId={activeRoom.id} onSent={() => loadMessages(activeRoom.id)} />}
      </div>
    </div>
  )
}
