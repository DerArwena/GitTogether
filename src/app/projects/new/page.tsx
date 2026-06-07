import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { createProject } from "@/server/actions/project";

export default async function NewProjectPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-lg">
          <h1 className="text-2xl font-bold tracking-tight">New project</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a new project hub for your GitHub repositories.
          </p>

          <form action={createProject} className="mt-8 space-y-5">
            <div>
              <label htmlFor="name" className="text-sm font-medium">
                Project name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="My Project"
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label htmlFor="slug" className="text-sm font-medium">
                URL slug
              </label>
              <input
                id="slug"
                name="slug"
                type="text"
                required
                placeholder="my-project"
                pattern="[a-z0-9-]+"
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Lowercase letters, numbers, and hyphens only.
              </p>
            </div>

            <div>
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                placeholder="A short description of your project..."
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            <div>
              <label htmlFor="websiteUrl" className="text-sm font-medium">
                Website URL
              </label>
              <input
                id="websiteUrl"
                name="websiteUrl"
                type="url"
                placeholder="https://example.com"
                className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                id="isPublic"
                name="isPublic"
                type="checkbox"
                defaultChecked
                className="size-4 rounded border-border"
              />
              <label htmlFor="isPublic" className="text-sm">
                Public project (anyone can view and request to join)
              </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit">Create project</Button>
              <Link
                href="/dashboard"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
