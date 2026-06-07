import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ArrowLeft, CreditCard, Check, FolderKanban, GitFork, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const memberships = await db.projectMember.findMany({
    where: { userId: session.user.id },
    include: {
      project: {
        include: { _count: { select: { members: true, linkedRepos: true } } },
      },
    },
  });

  const totalProjects = memberships.length;
  const totalMembers = memberships.reduce((s, m) => s + m.project._count.members, 0);
  const totalRepos = memberships.reduce((s, m) => s + m.project._count.linkedRepos, 0);

  const usageStats = [
    { label: "Projects", value: totalProjects, icon: FolderKanban, color: "text-chart-1" },
    { label: "Members", value: totalMembers, icon: Users, color: "text-chart-2" },
    { label: "Repos", value: totalRepos, icon: GitFork, color: "text-chart-3" },
  ];

  const plans = [
    {
      name: "Open Source", price: "Free", description: "For open source projects",
      features: ["Unlimited projects", "Up to 50 members per project", "GitHub issue sync", "Invite system", "Community support"],
      highlighted: true,
    },
    {
      name: "Team", price: "$12", description: "Per user / month",
      features: ["Everything in Open Source", "Unlimited members", "API access", "Priority support", "Custom branding"],
      highlighted: false,
    },
    {
      name: "Enterprise", price: "Custom", description: "For large organizations",
      features: ["Everything in Team", "SSO / SAML", "Audit logs", "Dedicated SLAs", "On-premise option"],
      highlighted: false,
    },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="size-8 rounded-lg">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Billing</h1>
          <p className="text-sm text-muted-foreground">Subscription and usage</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {usageStats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1.5">
              <Icon className={`size-4 ${color}`} />
              <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-5 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-chart-3/10">
              <CreditCard className="size-4 text-chart-3" />
            </div>
            <div>
              <p className="text-sm font-medium">Current plan</p>
              <p className="text-xs text-muted-foreground">Open Source — always free</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-medium text-green-600 bg-green-500/10 px-2 py-0.5 rounded-md">
            <span className="size-1.5 rounded-full bg-green-500" />
            Active
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`rounded-xl border p-5 ${
              plan.highlighted
                ? "border-foreground bg-card shadow-card"
                : "border-border bg-card/50"
            }`}
          >
            <h3 className="text-sm font-semibold">{plan.name}</h3>
            <p className="text-2xl font-bold mt-2">{plan.price}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{plan.description}</p>
            <ul className="mt-4 space-y-2">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Check className={`size-3.5 mt-0.5 shrink-0 ${plan.highlighted ? "text-foreground" : ""}`} />
                  {f}
                </li>
              ))}
            </ul>
            {plan.highlighted && (
              <p className="text-xs text-center mt-4 text-muted-foreground bg-muted rounded-md py-1">Current plan</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
