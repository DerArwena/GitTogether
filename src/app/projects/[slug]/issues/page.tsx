import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { getIssues } from "@/server/actions/repo";

export default async function ProjectIssuesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await auth();
  const project = await db.project.findUnique({
    where: { slug },
    include: { linkedRepos: true },
  });

  if (!project) notFound();

  const currentMember = session?.user?.id
    ? await db.projectMember.findUnique({
        where: {
          projectId_userId: { projectId: project.id, userId: session.user.id },
        },
      })
    : null;

  const issues = project.linkedRepos.length > 0
    ? await getIssues(project.id)
    : [];

  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Issues</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {project.name}
              </p>
            </div>
            <Link href={`/projects/${slug}`}>
              <Button variant="outline" size="sm">
                Back to project
              </Button>
            </Link>
          </div>

          {project.linkedRepos.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-12 text-center">
              <h2 className="text-lg font-semibold">No repos linked</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Link a GitHub repository to see its issues here.
              </p>
            </div>
          ) : issues.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-12 text-center">
              <h2 className="text-lg font-semibold">No open issues</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                All linked repositories have zero open issues.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {issues.map((issue: any) => (
                <a
                  key={issue.id}
                  href={issue.htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm hover:border-foreground/20 transition-colors"
                >
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-green-600/10 text-xs text-green-600">
                    !
                  </span>
                  <span className="font-medium">{issue.title}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {issue.repoName}#{issue.number}
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
