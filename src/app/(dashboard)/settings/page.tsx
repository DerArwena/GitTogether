import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { User, Users, CreditCard, Key, Shield, Bell, Puzzle, ToggleLeft } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { LinkGitHubButton } from "@/components/settings/link-github-button";

const settingsNav = [
  { label: "General", href: "/settings", icon: User, desc: "Profile and account" },
  { label: "Team", href: "/settings/team", icon: Users, desc: "Collaborators" },
  { label: "Billing", href: "/settings/billing", icon: CreditCard, desc: "Plan and usage" },
  { label: "API keys", href: "/settings/api-keys", icon: Key, desc: "Developer access" },
  { label: "Security", href: "/settings/security", icon: Shield, desc: "Sessions and auth" },
  { label: "Notifications", href: "/settings/notifications", icon: Bell, desc: "Email preferences" },
  { label: "Integrations", href: "/settings/integrations", icon: Puzzle, desc: "Connected services" },
  { label: "Features", href: "/settings/features", icon: ToggleLeft, desc: "Feature flags" },
];

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const githubAccount = await db.account.findFirst({
    where: { userId: session.user.id, provider: "github" },
    select: { providerAccountId: true },
  });

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Settings"
        description="Manage your account and workspace configuration."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {settingsNav.map(({ label, href, icon: Icon, desc }) => (
          <Link key={href} href={href}
            className="group rounded-lg border border-border bg-card p-4 hover:border-foreground/20 transition-all duration-200"
          >
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="flex size-7 items-center justify-center rounded bg-muted group-hover:bg-accent transition-colors">
                <Icon className="size-3.5 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium">{label}</span>
            </div>
            <p className="text-xs text-muted-foreground pl-9.5">{desc}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 sm:grid-cols-2 max-w-2xl">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex size-9 items-center justify-center rounded bg-muted">
              <User className="size-4 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Profile</h3>
              <p className="text-xs text-muted-foreground">Your account details</p>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            {[
              { label: "Name", value: session.user.name ?? "Not set" },
              { label: "Email", value: session.user.email },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between rounded-md bg-muted/50 px-3 py-2 text-xs">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex size-9 items-center justify-center rounded bg-muted">
              <svg viewBox="0 0 24 24" className="size-4 text-muted-foreground" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12 24 5.37 18.63 0 12 0z"/></svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Connected accounts</h3>
              <p className="text-xs text-muted-foreground">Link GitHub to access repos</p>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2.5 text-xs">
            <div className="flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12 24 5.37 18.63 0 12 0z"/></svg>
              <span className="font-medium">GitHub</span>
            </div>
            {githubAccount ? (
              <span className="flex items-center gap-1 text-emerald-500">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Connected
              </span>
            ) : (
              <LinkGitHubButton />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
