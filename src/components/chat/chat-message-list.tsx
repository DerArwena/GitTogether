"use client"

import { useEffect, useRef } from "react"
import { formatRelativeTime } from "@/lib/utils"

interface Message {
  id: string
  content: string
  createdAt: string
  user: { id: string; name: string | null; image: string | null }
  mentions?: { user: { id: string; name: string | null } }[]
}

export function ChatMessageList({ messages, currentUserId }: { messages: Message[]; currentUserId: string }) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {messages.map((msg) => {
        const isOwn = msg.user.id === currentUserId
        return (
          <div key={msg.id} className={`flex gap-2.5 ${isOwn ? "flex-row-reverse" : ""}`}>
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground overflow-hidden">
              {msg.user.image ? (
                <img src={msg.user.image} alt="" className="size-full object-cover" />
              ) : (
                msg.user.name?.[0] ?? "?"
              )}
            </div>
            <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"} flex flex-col`}>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[11px] font-medium">{msg.user.name ?? "Unknown"}</span>
                <span className="text-[10px] text-muted-foreground">{formatRelativeTime(msg.createdAt)}</span>
              </div>
              <div
                className={`rounded-lg px-3 py-1.5 text-sm ${
                  isOwn ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}
              >
                {msg.content}
              </div>
            </div>
          </div>
        )
      })}
      <div ref={bottomRef} />
    </div>
  )
}
