import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { Plus, FolderKanban } from "lucide-react";
import { createProject } from "@/server/actions/project";

export default async function NewProjectPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  return (
    <div className="p-6 max-w-lg">
      <div className="mb-8">
        <h1 className="text-xl font-semibold tracking-tight">New project</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Create a new project hub for your GitHub repositories.
        </p>
      </div>

      <form action={createProject} className="space-y-5">
        <div>
          <label htmlFor="name" className="text-sm font-medium block mb-1.5">
            Project name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            placeholder="My Project"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label htmlFor="description" className="text-sm font-medium block mb-1.5">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={3}
            placeholder="A short description of your project..."
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          />
        </div>

        <div>
          <label htmlFor="websiteUrl" className="text-sm font-medium block mb-1.5">
            Website URL
          </label>
          <input
            id="websiteUrl"
            name="websiteUrl"
            type="url"
            placeholder="https://example.com"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <label className="flex items-center gap-2.5 text-sm">
          <input
            id="isPublic"
            name="isPublic"
            type="checkbox"
            defaultChecked
            className="size-4 rounded border-border accent-foreground"
          />
          Public project
        </label>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 h-9 rounded-lg bg-foreground px-4 text-sm font-medium text-background hover:bg-foreground/90 transition-colors"
          >
            <Plus className="size-4" />
            Create project
          </button>
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
