import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { createInvite } from "@/server/actions/invite";
import { linkRepo, unlinkRepo } from "@/server/actions/repo";
import { deleteProject, updateProject } from "@/server/actions/project";

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
    <>
      <Navbar />
      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-lg">
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">{project.name}</p>
          </div>

          <section className="space-y-5">
            <h2 className="text-lg font-semibold">Project details</h2>
            <form
              action={updateProject.bind(null, project.id)}
              className="space-y-4"
            >
              <input type="hidden" name="slug" value={slug} />
              <div>
                <label htmlFor="name" className="text-sm font-medium">
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  defaultValue={project.name}
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label htmlFor="description" className="text-sm font-medium">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={project.description ?? ""}
                  className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
              <Button type="submit" size="sm">
                Save
              </Button>
            </form>
          </section>

          <section className="mt-10 space-y-4">
            <h2 className="text-lg font-semibold">Linked repositories</h2>
            {project.linkedRepos.length > 0 && (
              <div className="space-y-2">
                {project.linkedRepos.map((repo) => (
                  <div
                    key={repo.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <span className="text-sm">{repo.githubRepoName}</span>
                    <form
                      action={unlinkRepo.bind(null, project.id, repo.id)}
                    >
                      <Button
                        type="submit"
                        variant="outline"
                        size="xs"
                      >
                        Remove
                      </Button>
                    </form>
                  </div>
                ))}
              </div>
            )}
            <form action={linkRepo.bind(null, project.id)} className="flex gap-2">
              <input
                name="repoUrl"
                type="text"
                placeholder="https://github.com/owner/repo"
                className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button type="submit" size="sm">
                Link
              </Button>
            </form>
          </section>

          <section className="mt-10 space-y-4">
            <h2 className="text-lg font-semibold">Invites</h2>
            {project.invites.length > 0 && (
              <div className="space-y-2">
                {project.invites.map((invite) => (
                  <div
                    key={invite.id}
                    className="rounded-lg border border-border p-3 text-sm"
                  >
                    <code className="rounded bg-muted px-2 py-0.5 text-xs">
                      {invite.code}
                    </code>
                    <span className="ml-2 text-muted-foreground">
                      Role: {invite.role}
                      {invite.maxUses && ` · Max: ${invite.maxUses}`}
                      {invite.expiresAt &&
                        ` · Expires: ${invite.expiresAt.toLocaleDateString()}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
            <form
              action={createInvite.bind(null, project.id)}
              className="flex gap-2 items-end"
            >
              <div>
                <label htmlFor="role" className="text-xs font-medium">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  className="mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="member">Member</option>
                  <option value="viewer">Viewer</option>
                  <option value="maintainer">Maintainer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <Button type="submit" size="sm">
                Generate invite
              </Button>
            </form>
          </section>

          {member.role === "owner" && (
            <section className="mt-10 space-y-4">
              <h2 className="text-lg font-semibold text-destructive">
                Danger zone
              </h2>
              <form
                action={deleteProject.bind(null, project.id)}
                onSubmit={(e) => {
                  if (!confirm("Are you sure you want to delete this project?"))
                    e.preventDefault();
                }}
              >
                <Button type="submit" variant="destructive" size="sm">
                  Delete project
                </Button>
              </form>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
