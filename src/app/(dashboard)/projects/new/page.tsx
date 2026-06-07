import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { createProject } from "@/server/actions/project";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function NewProjectPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  return (
    <div className="p-6 lg:p-8 max-w-lg">
      <PageHeader
        title="New project"
        description="Create a new project hub for your GitHub repositories."
      />

      <Card>
        <CardContent className="px-6 py-6">
          <form action={createProject} className="space-y-5">
            <div>
              <label htmlFor="name" className="text-xs font-medium block mb-1.5">
                Project name
              </label>
              <Input id="name" name="name" type="text" required placeholder="My Project" />
            </div>

            <div>
              <label htmlFor="description" className="text-xs font-medium block mb-1.5">
                Description
              </label>
              <textarea
                id="description" name="description" rows={3}
                placeholder="A short description of your project..."
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-foreground/20 transition-all resize-none"
              />
            </div>

            <div>
              <label htmlFor="websiteUrl" className="text-xs font-medium block mb-1.5">
                Website URL
              </label>
              <Input id="websiteUrl" name="websiteUrl" type="url" placeholder="https://example.com" />
            </div>

            <label className="flex items-center gap-2.5 text-sm cursor-pointer">
              <div className="relative">
                <input
                  id="isPublic" name="isPublic" type="checkbox" value="true" defaultChecked
                  className="peer size-4 appearance-none rounded border border-border bg-background checked:bg-foreground checked:border-foreground transition-all cursor-pointer"
                />
                <input type="hidden" name="isPublic" value="false" />
                <svg className="absolute inset-0 size-4 text-background opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" viewBox="0 0 16 16" fill="none">
                  <path d="M4 8l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              Public project
            </label>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" className="gap-1.5">
                <Plus className="size-3.5" />
                Create project
              </Button>
              <a href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
