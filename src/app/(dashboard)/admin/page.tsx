import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Users, Shield, Activity, FileText } from "lucide-react";
import Link from "next/link";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const totalUsers = await db.user.count();
  const totalProjects = await db.project.count();
  const totalMemberships = await db.projectMember.count();
  const pendingRequests = await db.joinRequest.count({ where: { status: "pending" } });

  const stats = [
    { label: "Users", value: totalUsers, icon: Users, href: "/admin/users" },
    { label: "Projects", value: totalProjects, icon: FileText, href: "/admin" },
    { label: "Memberships", value: totalMemberships, icon: Activity, href: "/admin" },
    { label: "Pending requests", value: pendingRequests, icon: Shield, href: "/admin/audit" },
  ];

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Administration</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          System overview and management.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href}
            className="rounded-lg border border-border bg-background p-5 hover:border-foreground/20 transition-colors"
          >
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Icon className="size-4" />
              <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-2xl font-semibold">{value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-background p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Quick links</h3>
          </div>
          <div className="space-y-2">
            <Link href="/admin/users" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
              → Manage users
            </Link>
            <Link href="/admin/roles" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
              → Roles & permissions
            </Link>
            <Link href="/admin/audit" className="block text-sm text-muted-foreground hover:text-foreground transition-colors">
              → Audit log
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-background p-5">
          <h3 className="text-sm font-semibold mb-4">System status</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Database</span>
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-green-500" />
                Connected
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Authentication</span>
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-green-500" />
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">GitHub API</span>
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-green-500" />
                Available
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
