"use client"

import { useState, useEffect } from "react"
import { getChatRooms, getUnreadCounts } from "@/server/actions/chat"
import { MessageSquare, Hash, Bot, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatRelativeTime } from "@/lib/utils"

interface Room {
  id: string
  name: string | null
  type: string
  projectId: string | null
  _count: { messages: number }
  readReceipts: { lastReadAt: string }[]
  messages: { content: string; createdAt: string; user: { name: string | null } }[]
}

export function ChatSidebar({
  activeRoomId,
  onSelectRoom,
  rooms,
  unreadMap,
}: {
  activeRoomId?: string
  onSelectRoom: (room: Room) => void
  rooms: Room[]
  unreadMap: Record<string, number>
}) {
  return (
    <div className="w-64 border-r border-border bg-card flex flex-col">
      <div className="p-3 border-b border-border">
        <h2 className="text-sm font-semibold flex items-center gap-2">
          <MessageSquare className="size-4 text-muted-foreground" />
          Chat
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {rooms.map((room) => {
          const unread = unreadMap[room.id] ?? 0
          return (
            <button
              key={room.id}
              onClick={() => onSelectRoom(room)}
              className={cn(
                "w-full text-left rounded-lg p-2.5 transition-colors",
                activeRoomId === room.id
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="flex items-center justify-between mb-0.5">
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  {room.type === "workspace" ? (
                    <Bot className="size-3.5 text-chart-1" />
                  ) : (
                    <Hash className="size-3.5 text-chart-2" />
                  )}
                  <span className="truncate">{room.name ?? "Chat"}</span>
                </div>
                {unread > 0 && (
                  <span className="flex items-center justify-center min-w-[16px] h-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground px-1">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </div>
              {room.messages[0] && (
                <p className="text-[11px] text-muted-foreground truncate pl-5">
                  {room.messages[0].user.name}: {room.messages[0].content}
                </p>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
