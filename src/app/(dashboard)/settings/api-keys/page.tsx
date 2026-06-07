import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ArrowLeft, Key, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CreateApiKeyForm } from "@/components/settings/create-api-key";
import { revokeApiKey } from "@/server/actions/api-key";

export default async function ApiKeysPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const keys = await db.apiKey.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
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
          <h1 className="text-xl font-bold tracking-tight">API keys</h1>
          <p className="text-sm text-muted-foreground">Developer API access</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex size-8 items-center justify-center rounded-lg bg-chart-2/10">
            <Key className="size-4 text-chart-2" />
          </div>
          <h3 className="text-sm font-semibold">Create a new key</h3>
        </div>
        <CreateApiKeyForm />
      </div>

      {keys.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="divide-y divide-border">
            {keys.map((k) => (
              <div key={k.id} className="flex items-center justify-between p-4 text-sm hover:bg-accent/30 transition-colors">
                <div>
                  <p className="font-medium">{k.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Created {new Date(k.createdAt).toLocaleDateString()}
                    {k.lastUsedAt ? ` · Last used ${new Date(k.lastUsedAt).toLocaleDateString()}` : " · Never used"}
                  </p>
                </div>
                <form action={revokeApiKey.bind(null, k.id)}>
                  <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                    <Trash2 className="size-3.5" />
                  </Button>
                </form>
              </div>
            ))}
          </div>
        </div>
      )}

      {keys.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
          <div className="flex justify-center mb-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
              <Key className="size-5 text-muted-foreground" />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">No API keys yet. Create one above.</p>
        </div>
      )}
    </div>
  );
}
