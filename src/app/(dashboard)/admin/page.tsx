import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Users, Shield, Activity, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const totalUsers = await db.user.count();
  const totalProjects = await db.project.count();
  const totalMemberships = await db.projectMember.count();
  const pendingRequests = await db.joinRequest.count({ where: { status: "pending" } });

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <PageHeader
        title="Administration"
        description="System overview and management."
      />

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Users", value: totalUsers, icon: Users, href: "/admin/users" },
          { label: "Projects", value: totalProjects, icon: FileText, href: "/admin" },
          { label: "Memberships", value: totalMemberships, icon: Activity, href: "/admin" },
          { label: "Pending", value: pendingRequests, icon: Shield, href: "/admin/audit" },
        ].map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href}
            className="rounded-lg border border-border bg-card p-4 hover:border-foreground/20 transition-all duration-200"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex size-6 items-center justify-center rounded bg-muted">
                <Icon className="size-3 text-muted-foreground" />
              </div>
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
            </div>
            <p className="text-2xl font-semibold tracking-tight">{value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Quick links</h3>
          </div>
          <div className="space-y-1">
            <Link href="/admin/users" className="group flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
              Manage users
              <ArrowRight className="size-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link href="/admin/roles" className="group flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
              Roles & permissions
              <ArrowRight className="size-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link href="/admin/audit" className="group flex items-center justify-between rounded-md px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
              Audit log
              <ArrowRight className="size-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-sm font-semibold mb-4">System status</h3>
          <div className="space-y-2 text-sm">
            {[
              { label: "Database", status: "Connected", color: "bg-green-500" },
              { label: "Authentication", status: "Active", color: "bg-green-500" },
              { label: "GitHub API", status: "Available", color: "bg-yellow-500" },
            ].map(({ label, status, color }) => (
              <div key={label} className="flex items-center justify-between rounded-md bg-muted/50 px-3 py-2">
                <span className="text-muted-foreground text-xs">{label}</span>
                <span className="flex items-center gap-1.5 text-xs font-medium">
                  <span className={`size-1.5 rounded-full ${color}`} />
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
