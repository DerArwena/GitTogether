import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ArrowLeft, Link2, Trash2, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createInvite } from "@/server/actions/invite";
import { unlinkRepo } from "@/server/actions/repo";
import { updateProject } from "@/server/actions/project";
import { DeleteProjectForm } from "@/components/projects/delete-project-form";
import { RepoLinkForm } from "@/components/projects/repo-link-form";

export default async function ProjectSettingsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const project = await db.project.findUnique({
    where: { slug },
    include: { linkedRepos: true, invites: true },
  });

  if (!project) notFound();

  const member = await db.projectMember.findUnique({
    where: {
      projectId_userId: { projectId: project.id, userId: session.user.id },
    },
  });

  if (!member || !["owner", "admin"].includes(member.role)) {
    redirect(`/projects/${slug}`);
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/projects/${slug}`}>
          <Button variant="ghost" size="icon" className="size-8">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Project settings</h1>
          <p className="text-sm text-muted-foreground">{project.name}</p>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="mb-6 rounded-xl p-0.5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="repos" className="gap-1.5">
            <Link2 className="size-3.5" />
            Repos
          </TabsTrigger>
          <TabsTrigger value="invites" className="gap-1.5">
            <Key className="size-3.5" />
            Invites
          </TabsTrigger>
          {member.role === "owner" && (
            <TabsTrigger value="danger" className="text-destructive gap-1.5">
              <Trash2 className="size-3.5" />
              Danger
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="general" className="space-y-5">
          <form action={updateProject.bind(null, project.id)} className="space-y-4">
            <input type="hidden" name="slug" value={slug} />
            <div>
              <label htmlFor="name" className="text-sm font-medium block mb-1.5">Name</label>
              <input
                id="name" name="name" type="text"
                defaultValue={project.name}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-foreground/20 transition-all"
              />
            </div>
            <div>
              <label htmlFor="description" className="text-sm font-medium block mb-1.5">Description</label>
              <textarea
                id="description" name="description" rows={3}
                defaultValue={project.description ?? ""}
                className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-foreground/20 transition-all resize-none"
              />
            </div>
            <Button type="submit" size="sm">Save changes</Button>
          </form>
        </TabsContent>

        <TabsContent value="repos" className="space-y-4">
          {project.linkedRepos.length > 0 && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="divide-y divide-border">
                {project.linkedRepos.map((repo) => (
                  <div key={repo.id} className="flex items-center justify-between p-3.5 text-sm">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-7 items-center justify-center rounded-lg bg-muted">
                        <svg viewBox="0 0 24 24" className="size-3.5 text-muted-foreground" fill="currentColor">
                          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12 24 5.37 18.63 0 12 0z" />
                        </svg>
                      </div>
                      <span className="font-medium">{repo.githubRepoName}</span>
                    </div>
                    <form action={unlinkRepo.bind(null, project.id, repo.id)}>
                      <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="size-3.5" />
                      </Button>
                    </form>
                  </div>
                ))}
              </div>
            </div>
          )}
          <RepoLinkForm projectId={project.id} />
        </TabsContent>

        <TabsContent value="invites" className="space-y-4">
          {project.invites.length > 0 && (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="divide-y divide-border">
                {project.invites.map((invite) => (
                  <div key={invite.id} className="flex items-center gap-3 p-3.5 text-sm">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-muted">
                      <Key className="size-3.5 text-muted-foreground" />
                    </div>
                    <code className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-mono">{invite.code}</code>
                    <span className="text-muted-foreground capitalize">{invite.role}</span>
                    {invite.maxUses && <span className="text-muted-foreground">· {invite.usedCount}/{invite.maxUses}</span>}
                    {invite.expiresAt && (
                      <span className="text-muted-foreground">· expires {invite.expiresAt.toLocaleDateString()}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          <form action={createInvite.bind(null, project.id)} className="flex gap-2 items-end">
            <div>
              <label htmlFor="role" className="text-xs font-semibold block mb-1.5">Role</label>
              <select id="role" name="role"
                className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
              >
                <option value="member">Member</option>
                <option value="viewer">Viewer</option>
                <option value="maintainer">Maintainer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <Button type="submit" size="sm">Generate invite</Button>
          </form>
        </TabsContent>

        {member.role === "owner" && (
          <TabsContent value="danger">
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-5">
              <div className="flex size-9 items-center justify-center rounded-lg bg-destructive/10 mb-3">
                <Trash2 className="size-4 text-destructive" />
              </div>
              <h3 className="text-sm font-semibold text-destructive mb-1">Delete project</h3>
              <p className="text-xs text-muted-foreground mb-4">
                This permanently deletes the project and all associated data. This action cannot be undone.
              </p>
              <DeleteProjectForm projectId={project.id} />
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
