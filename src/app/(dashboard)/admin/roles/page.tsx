import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ArrowLeft, Shield, ShieldCheck, ShieldOff, Eye, Users, Settings, Key } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const roles = [
  {
    role: "owner", icon: ShieldCheck, level: 4,
    description: "Full control over the project",
    permissions: ["Delete project", "Transfer ownership", "Manage all settings"],
  },
  {
    role: "admin", icon: Shield, level: 3,
    description: "Manage members and settings",
    permissions: ["Manage members", "Project settings", "Manage invites", "Link repos"],
  },
  {
    role: "maintainer", icon: Settings, level: 2,
    description: "Manage repos and invites",
    permissions: ["Link/unlink repos", "Create invites", "View analytics"],
  },
  {
    role: "member", icon: Users, level: 1,
    description: "View and participate",
    permissions: ["View project", "View issues", "View members"],
  },
  {
    role: "viewer", icon: Eye, level: 0,
    description: "Read-only access",
    permissions: ["View project (read-only)"],
  },
];

export default async function RolesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon" className="size-8">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Roles & permissions</h1>
          <p className="text-sm text-muted-foreground">Predefined roles for project access control</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Permissions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map(({ role, icon: Icon, level, description, permissions }, i) => (
              <TableRow key={role}>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <div className={`flex size-7 items-center justify-center rounded-lg ${
                      i === 0 ? "bg-chart-1/10 text-chart-1" :
                      i === 1 ? "bg-chart-2/10 text-chart-2" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      <Icon className="size-3.5" />
                    </div>
                    <span className="font-medium capitalize">{role}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="rounded-md font-mono">{level}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{description}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {permissions.map((p) => (
                      <span key={p} className="text-[10px] bg-muted px-1.5 py-0.5 rounded-md text-muted-foreground">
                        {p}
                      </span>
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
