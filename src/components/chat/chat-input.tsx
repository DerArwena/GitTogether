"use client"

import { useState } from "react"
import { sendMessage } from "@/server/actions/chat"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

export function ChatInput({ roomId, onSent }: { roomId: string; onSent?: () => void }) {
  const [content, setContent] = useState("")
  const [sending, setSending] = useState(false)

  async function handleSend() {
    if (!content.trim() || sending) return
    setSending(true)
    const fd = new FormData()
    fd.set("roomId", roomId)
    fd.set("content", content)
    await sendMessage(fd)
    setContent("")
    setSending(false)
    onSent?.()
  }

  return (
    <div className="border-t border-border p-3 flex items-center gap-2">
      <Input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type a message... @mention to notify"
        className="h-9 text-sm"
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
          }
        }}
      />
      <Button size="icon-sm" onClick={handleSend} disabled={!content.trim() || sending}>
        <Send className="size-3.5" />
      </Button>
    </div>
  )
}
