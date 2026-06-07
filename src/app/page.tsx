import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl">
            Your GitHub project's
            <span className="text-muted-foreground"> HQ</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
            GitTogether gives every GitHub repository a dedicated hub —
            manage your team, see your issues, and control who has access.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/auth/signin"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-foreground px-6 text-sm font-medium text-background hover:bg-foreground/90 transition-colors"
            >
              Get started
            </Link>
            <Link
              href="/auth/signin"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-6 text-sm font-medium hover:bg-muted transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>

        <div className="mt-24 grid w-full max-w-4xl grid-cols-1 gap-8 sm:grid-cols-3">
          <div className="rounded-lg border border-border p-6">
            <h3 className="font-semibold">Project profile</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              A dedicated page for every project. Description, repos, members —
              all in one place.
            </p>
          </div>
          <div className="rounded-lg border border-border p-6">
            <h3 className="font-semibold">Team management</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Roles, invites, and join requests. Control who has access and what
              they can do.
            </p>
          </div>
          <div className="rounded-lg border border-border p-6">
            <h3 className="font-semibold">Issue visibility</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              See open issues across all your linked repos in a single
              aggregated feed.
            </p>
          </div>
        </div>
      </main>
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        GitTogether — MIT licensed
      </footer>
    </>
  );
}
