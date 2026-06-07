import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ArrowLeft, User, Users, CreditCard, Key, Shield, Bell, Puzzle, ToggleLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const settingsNav = [
  { label: "General", href: "/settings", icon: User },
  { label: "Team", href: "/settings/team", icon: Users },
  { label: "Billing", href: "/settings/billing", icon: CreditCard },
  { label: "API keys", href: "/settings/api-keys", icon: Key },
  { label: "Security", href: "/settings/security", icon: Shield },
  { label: "Notifications", href: "/settings/notifications", icon: Bell },
  { label: "Integrations", href: "/settings/integrations", icon: Puzzle },
  { label: "Features", href: "/settings/features", icon: ToggleLeft },
];

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your account and workspace configuration.
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {settingsNav.map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href}
            className="flex items-center gap-3 rounded-lg border border-border bg-background p-4 text-sm font-medium hover:border-foreground/20 transition-colors"
          >
            <Icon className="size-4 text-muted-foreground" />
            {label}
          </Link>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-background p-5 max-w-lg">
        <h3 className="text-sm font-semibold mb-3">Profile</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name</span>
            <span>{session.user.name ?? "Not set"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span>{session.user.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
