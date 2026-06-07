import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ArrowLeft, Shield, Monitor } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RevokeSessionButton } from "@/components/settings/revoke-session-button";

export default async function SecurityPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const sessions = await db.session.findMany({
    where: { userId: session.user.id },
    orderBy: { expires: "desc" },
  });

  return (
    <div className="p-6 lg:p-8 max-w-lg">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="size-8 rounded-lg">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Security</h1>
          <p className="text-sm text-muted-foreground">Security settings</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
              <Shield className="size-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">Two-factor authentication</p>
              <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
            </div>
          </div>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">Coming soon</span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h3 className="text-sm font-semibold">Active sessions</h3>
          <span className="text-xs text-muted-foreground">{sessions.length} session{sessions.length !== 1 ? "s" : ""}</span>
        </div>
        <div className="divide-y divide-border">
          {sessions.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No active sessions found.</div>
          ) : (
            sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-4 text-sm hover:bg-accent/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
                    <Monitor className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Session</p>
                    <p className="text-xs text-muted-foreground">
                      Expires {new Date(s.expires).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <RevokeSessionButton sessionId={s.id} />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
