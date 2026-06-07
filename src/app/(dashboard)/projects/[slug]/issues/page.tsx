import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ArrowLeft, AlertCircle, GitPullRequest } from "lucide-react";
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
  if (!session?.user) return null;

  const issues = project.linkedRepos.length > 0
    ? await getIssues(project.id, session.user.id)
    : [];

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/projects/${slug}`}>
          <Button variant="ghost" size="icon" className="size-8">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Issues</h1>
          <p className="text-sm text-muted-foreground">{project.name}</p>
        </div>
      </div>

      {project.linkedRepos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
              <GitPullRequest className="size-6 text-muted-foreground" />
            </div>
          </div>
          <h3 className="font-semibold">No repos linked</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs mx-auto">
            Link a GitHub repository to see its issues here.
          </p>
        </div>
      ) : issues.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
              <AlertCircle className="size-6 text-muted-foreground" />
            </div>
          </div>
          <h3 className="font-semibold">No open issues</h3>
          <p className="text-sm text-muted-foreground mt-1">
            All linked repositories have zero open issues.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="divide-y divide-border">
            {issues.map((issue: any) => (
              <a
                key={issue.id}
                href={issue.htmlUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 text-sm hover:bg-accent/50 transition-colors"
              >
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-green-600/10 text-[10px] text-green-600 font-semibold">
                  !
                </span>
                <span className="font-medium flex-1 min-w-0 truncate">{issue.title}</span>
                <span className="text-xs text-muted-foreground shrink-0 bg-muted px-2 py-0.5 rounded-md">
                  {issue.repoName}#{issue.number}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
