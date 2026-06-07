import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { ArrowLeft, AlertCircle } from "lucide-react";
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

  const issues = project.linkedRepos.length > 0
    ? await getIssues(project.id)
    : [];

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/projects/${slug}`}>
          <Button variant="ghost" size="icon" className="size-8">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Issues</h1>
          <p className="text-sm text-muted-foreground">{project.name}</p>
        </div>
      </div>

      {project.linkedRepos.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <AlertCircle className="size-8 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-medium">No repos linked</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Link a GitHub repository to see its issues here.
          </p>
        </div>
      ) : issues.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <AlertCircle className="size-8 mx-auto text-muted-foreground mb-3" />
          <h3 className="font-medium">No open issues</h3>
          <p className="text-sm text-muted-foreground mt-1">
            All linked repositories have zero open issues.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-background divide-y divide-border">
          {issues.map((issue: any) => (
            <a
              key={issue.id}
              href={issue.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 text-sm hover:bg-muted/50 transition-colors"
            >
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-green-600/10 text-[10px] text-green-600 font-medium">
                !
              </span>
              <span className="font-medium flex-1 min-w-0 truncate">{issue.title}</span>
              <span className="text-xs text-muted-foreground shrink-0">
                {issue.repoName}#{issue.number}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
