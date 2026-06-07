import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ArrowLeft, Shield, ShieldCheck, ShieldOff } from "lucide-react";
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

const roleDescriptions: Record<string, { icon: any; description: string }> = {
  owner: { icon: ShieldCheck, description: "Full control over the project" },
  admin: { icon: Shield, description: "Manage members and settings" },
  maintainer: { icon: Shield, description: "Manage repos and invites" },
  member: { icon: Shield, description: "View and participate" },
  viewer: { icon: ShieldOff, description: "Read-only access" },
};

export default async function RolesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="icon" className="size-8">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Roles & permissions</h1>
          <p className="text-sm text-muted-foreground">Predefined roles for project access control</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background overflow-hidden">
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
            {Object.entries(roleDescriptions).map(([role, { icon: Icon, description }], i) => (
              <TableRow key={role}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Icon className="size-4 text-muted-foreground" />
                    <span className="font-medium capitalize">{role}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{i}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{description}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {role === "owner" && "Delete, transfer, manage all"}
                  {role === "admin" && "Members, settings, invites"}
                  {role === "maintainer" && "Repos, invites, issues"}
                  {role === "member" && "View projects, issues, members"}
                  {role === "viewer" && "Read-only access"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
