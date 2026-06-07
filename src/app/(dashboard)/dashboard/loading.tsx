export default function DashboardLoading() {
  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="space-y-1.5">
        <div className="h-6 w-64 rounded-md bg-muted animate-pulse" />
        <div className="h-4 w-48 rounded-md bg-muted animate-pulse" />
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="size-6 rounded bg-muted animate-pulse" />
              <div className="h-3 w-20 rounded bg-muted animate-pulse" />
            </div>
            <div className="h-7 w-12 rounded bg-muted animate-pulse" />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-4 w-28 rounded bg-muted animate-pulse" />
          <div className="grid gap-2 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border border-border bg-card p-4">
                <div className="h-4 w-32 rounded bg-muted animate-pulse mb-2" />
                <div className="h-3 w-48 rounded bg-muted animate-pulse mb-3" />
                <div className="flex gap-3">
                  <div className="h-3 w-12 rounded bg-muted animate-pulse" />
                  <div className="h-3 w-12 rounded bg-muted animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="h-4 w-24 rounded bg-muted animate-pulse" />
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="h-4 w-32 rounded bg-muted animate-pulse mx-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}
