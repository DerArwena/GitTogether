"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Copy, Check } from "lucide-react";
import { createApiKey } from "@/server/actions/api-key";

export function CreateApiKeyForm() {
  const [name, setName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const key = await createApiKey(name.trim());
    setNewKey(key);
    setName("");
  }

  async function copyKey() {
    if (newKey) {
      await navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (newKey) {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium text-green-600">API key created!</p>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded border border-border bg-muted px-3 py-2 text-xs break-all">{newKey}</code>
          <Button size="sm" variant="outline" onClick={copyKey}>
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">Make sure to copy this now — you won&apos;t be able to see it again.</p>
        <Button size="sm" onClick={() => setNewKey(null)}>Create another</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Development"
        className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <Button type="submit" size="sm">
        <Plus className="size-3.5 mr-1" />
        Create
      </Button>
    </form>
  );
}
