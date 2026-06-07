"use client"

import { useState, useEffect } from "react"
import { getProjectLabels, toggleTaskLabel, createTaskLabel } from "@/server/actions/task"
import { Plus, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Label {
  id: string
  name: string
  color: string
}

export function TaskLabelPicker({ taskId, projectId, selected, onClose }: {
  taskId: string
  projectId: string
  selected: string[]
  onClose: () => void
}) {
  const [labels, setLabels] = useState<Label[]>([])
  const [newName, setNewName] = useState("")
  const [newColor, setNewColor] = useState("#6366f1")

  useEffect(() => {
    getProjectLabels(projectId).then((res) => {
      if (res.success && res.data) setLabels(res.data)
    })
  }, [projectId])

  async function handleToggle(labelId: string) {
    await toggleTaskLabel(taskId, labelId)
    setLabels((prev) => [...prev])
  }

  async function handleCreate() {
    if (!newName.trim()) return
    const fd = new FormData()
    fd.set("projectId", projectId)
    fd.set("name", newName.trim())
    fd.set("color", newColor)
    const res = await createTaskLabel(fd)
    if (res.success && res.data) {
      const label = res.data
      setLabels((prev) => [...prev, label])
      setNewName("")
    }
  }

  return (
    <div className="p-2 space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {labels.map((label) => {
          const active = selected.includes(label.id)
          return (
            <button
              key={label.id}
              onClick={() => handleToggle(label.id)}
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-all border ${
                active ? "border-current" : "border-transparent opacity-60 hover:opacity-100"
              }`}
              style={{ backgroundColor: `${label.color}20`, color: label.color }}
            >
              {active && <Check className="size-2.5" />}
              {label.name}
            </button>
          )
        })}
      </div>
      <div className="flex items-center gap-1.5 pt-1 border-t border-border">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New label..."
          className="h-6 text-[11px] px-2"
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
        <input
          type="color"
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          className="size-6 rounded cursor-pointer border border-border"
        />
        <Button size="icon-xs" variant="ghost" onClick={handleCreate}>
          <Plus className="size-3" />
        </Button>
      </div>
    </div>
  )
}
