export default function ProjectsLoading() {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="space-y-1.5">
        <div className="h-6 w-40 rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-56 rounded-md bg-muted animate-pulse" />
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="h-4 w-32 rounded bg-muted animate-pulse" />
              <div className="h-3 w-14 rounded bg-muted animate-pulse" />
            </div>
            <div className="h-3 w-48 rounded bg-muted animate-pulse mb-2" />
            <div className="flex gap-3">
              <div className="h-3 w-12 rounded bg-muted animate-pulse" />
              <div className="h-3 w-12 rounded bg-muted animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
