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
    <div className="p-6 max-w-lg">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="size-8">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Security</h1>
          <p className="text-sm text-muted-foreground">Security settings</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background p-5 space-y-4 mb-4">
        <div className="flex items-center justify-between text-sm">
          <div>
            <p className="font-medium">Two-factor authentication</p>
            <p className="text-xs text-muted-foreground">Add an extra layer of security to your account</p>
          </div>
          <span className="text-xs text-muted-foreground">Coming soon</span>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background">
        <div className="p-4 border-b border-border">
          <h3 className="text-sm font-semibold">Active sessions ({sessions.length})</h3>
        </div>
        <div className="divide-y divide-border">
          {sessions.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No active sessions found.</div>
          ) : (
            sessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 text-sm">
                <div className="flex items-center gap-2">
                  <Monitor className="size-4 text-muted-foreground" />
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
