import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { ArrowRight, FolderKanban, Users, GitFork, CheckCircle, Lock, Bell, Zap } from "lucide-react";

const features = [
  {
    icon: FolderKanban,
    title: "Project profile",
    description: "A dedicated page for every project. Description, repos, members — all in one place.",
    color: "from-chart-1/20 to-chart-1/5",
    iconColor: "text-chart-1",
  },
  {
    icon: Users,
    title: "Team management",
    description: "Roles, invites, and join requests. Control who has access and what they can do.",
    color: "from-chart-2/20 to-chart-2/5",
    iconColor: "text-chart-2",
  },
  {
    icon: GitFork,
    title: "Issue aggregation",
    description: "See open issues across all your linked repos in a single aggregated feed.",
    color: "from-chart-3/20 to-chart-3/5",
    iconColor: "text-chart-3",
  },
  {
    icon: Lock,
    title: "Access control",
    description: "Five roles from owner to viewer. Granular permissions for every member.",
    color: "from-chart-4/20 to-chart-4/5",
    iconColor: "text-chart-4",
  },
  {
    icon: Bell,
    title: "Join requests",
    description: "Review and approve members. Keep your project secure with invite-only mode.",
    color: "from-chart-5/20 to-chart-5/5",
    iconColor: "text-chart-5",
  },
  {
    icon: Zap,
    title: "Quick setup",
    description: "Link repos, invite members, and get your project running in minutes.",
    color: "from-chart-1/20 to-chart-2/5",
    iconColor: "text-chart-1",
  },
];

const steps = [
  { number: "01", title: "Create a project", description: "Give your project a name and description. Public or private — your choice." },
  { number: "02", title: "Link repositories", description: "Connect GitHub repos. GitTogether aggregates issues automatically." },
  { number: "03", title: "Invite your team", description: "Send invite links with specific roles. Review join requests as they come in." },
];

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="relative flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 size-96 rounded-full bg-chart-1/5 blur-3xl" />
            <div className="absolute bottom-1/4 left-1/3 size-64 rounded-full bg-chart-2/5 blur-3xl" />
          </div>

          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/80 backdrop-blur-sm px-3 py-1 text-xs text-muted-foreground mb-8 animate-fade-up">
              <span className="size-1.5 rounded-full bg-green-500" />
              Open source &middot; MIT licensed
            </div>

            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl animate-fade-up animate-fade-up-delay-1">
              Your GitHub project&apos;s
              <br />
              <span className="bg-gradient-to-r from-foreground via-chart-1 to-chart-2 bg-clip-text text-transparent">HQ</span>
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed animate-fade-up animate-fade-up-delay-2">
              GitTogether gives every GitHub repository a dedicated hub —
              manage your team, see your issues, and control who has access.
            </p>

            <div className="mt-10 flex items-center justify-center gap-4 animate-fade-up animate-fade-up-delay-3">
              <Link
                href="/auth/signin"
                className="group inline-flex h-11 items-center justify-center rounded-xl bg-foreground px-6 text-sm font-medium text-background hover:bg-foreground/90 transition-all hover:shadow-lg hover:shadow-foreground/10"
              >
                Get started
                <ArrowRight className="size-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/auth/signin"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-border px-6 text-sm font-medium hover:bg-accent transition-colors"
              >
                Sign in
              </Link>
            </div>

            <div className="mt-12 flex items-center justify-center gap-6 text-xs text-muted-foreground animate-fade-in animate-fade-up-delay-3">
              <div className="flex items-center gap-1.5">
                <CheckCircle className="size-3.5 text-green-500" />
                No credit card
              </div>
              <div className="flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12 24 5.37 18.63 0 12 0z" /></svg>
                GitHub powered
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle className="size-3.5 text-green-500" />
                Self-hostable
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 pb-24">
          <div className="mx-auto max-w-5xl">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold tracking-tight">Everything you need</h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                From project setup to member management — GitTogether keeps your team in sync.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, description, color, iconColor }) => (
                <div
                  key={title}
                  className="group relative rounded-xl border border-border bg-card p-6 hover:border-foreground/20 hover:shadow-sm transition-all duration-200 hover-lift"
                >
                  <div className={`absolute inset-0 rounded-xl bg-gradient-to-br ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="relative">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-muted mb-4 group-hover:bg-background/50 transition-colors">
                      <Icon className={`size-5 text-muted-foreground ${iconColor} transition-colors`} />
                    </div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-border px-6 py-24">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-bold tracking-tight">How it works</h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                Get your project up and running in three simple steps.
              </p>
            </div>
            <div className="grid gap-8 sm:grid-cols-3">
              {steps.map(({ number, title, description }) => (
                <div key={number} className="text-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-foreground text-background text-sm font-bold mx-auto mb-4">
                    {number}
                  </div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-border px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">
              Ready to give your project a home?
            </h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-sm mx-auto">
              Join GitTogether and start managing your GitHub projects the way they should be.
            </p>
            <Link
              href="/auth/signin"
              className="mt-8 inline-flex h-11 items-center justify-center rounded-xl bg-foreground px-6 text-sm font-medium text-background hover:bg-foreground/90 transition-all hover:shadow-lg hover:shadow-foreground/10"
            >
              Get started for free
              <ArrowRight className="size-4 ml-2" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <div className="mx-auto max-w-6xl px-6 flex items-center justify-between">
          <span className="font-semibold tracking-tight">GitTogether</span>
          <span>MIT licensed &middot; Open source</span>
        </div>
      </footer>
    </>
  );
}
