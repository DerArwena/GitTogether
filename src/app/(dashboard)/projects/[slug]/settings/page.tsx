import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ArrowLeft, Link2, Trash2, Users, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createInvite } from "@/server/actions/invite";
import { linkRepo, unlinkRepo } from "@/server/actions/repo";
import { updateProject } from "@/server/actions/project";
import { DeleteProjectForm } from "@/components/projects/delete-project-form";

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
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/projects/${slug}`}>
          <Button variant="ghost" size="icon" className="size-8">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Project settings</h1>
          <p className="text-sm text-muted-foreground">{project.name}</p>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="repos">
            <Link2 className="size-3.5 mr-1.5" />
            Repos
          </TabsTrigger>
          <TabsTrigger value="invites">
            <Key className="size-3.5 mr-1.5" />
            Invites
          </TabsTrigger>
          {member.role === "owner" && (
            <TabsTrigger value="danger" className="text-destructive">
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
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="description" className="text-sm font-medium block mb-1.5">Description</label>
              <textarea
                id="description" name="description" rows={3}
                defaultValue={project.description ?? ""}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
            <Button type="submit" size="sm">Save</Button>
          </form>
        </TabsContent>

        <TabsContent value="repos" className="space-y-4">
          {project.linkedRepos.length > 0 && (
            <div className="rounded-lg border border-border bg-background divide-y divide-border">
              {project.linkedRepos.map((repo) => (
                <div key={repo.id} className="flex items-center justify-between p-3 text-sm">
                  <span className="font-medium">{repo.githubRepoName}</span>
                  <form action={unlinkRepo.bind(null, project.id, repo.id)}>
                    <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                      <Trash2 className="size-3.5" />
                    </Button>
                  </form>
                </div>
              ))}
            </div>
          )}
          <form action={linkRepo.bind(null, project.id)} className="flex gap-2">
            <input
              name="repoUrl" type="text"
              placeholder="https://github.com/owner/repo"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button type="submit" size="sm">Link</Button>
          </form>
        </TabsContent>

        <TabsContent value="invites" className="space-y-4">
          {project.invites.length > 0 && (
            <div className="rounded-lg border border-border bg-background divide-y divide-border">
              {project.invites.map((invite) => (
                <div key={invite.id} className="flex items-center gap-3 p-3 text-sm">
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono">{invite.code}</code>
                  <span className="text-muted-foreground capitalize">{invite.role}</span>
                  {invite.maxUses && <span className="text-muted-foreground">· {invite.usedCount}/{invite.maxUses}</span>}
                  {invite.expiresAt && (
                    <span className="text-muted-foreground">· expires {invite.expiresAt.toLocaleDateString()}</span>
                  )}
                </div>
              ))}
            </div>
          )}
          <form action={createInvite.bind(null, project.id)} className="flex gap-2 items-end">
            <div>
              <label htmlFor="role" className="text-xs font-medium block mb-1">Role</label>
              <select id="role" name="role"
                className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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
            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <h3 className="text-sm font-semibold text-destructive mb-1">Delete project</h3>
              <p className="text-xs text-muted-foreground mb-3">
                This permanently deletes the project and all associated data.
              </p>
              <DeleteProjectForm projectId={project.id} />
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
