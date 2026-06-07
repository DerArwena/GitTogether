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
    <div className="p-6 max-w-lg">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="size-8">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">API keys</h1>
          <p className="text-sm text-muted-foreground">Developer API access</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background p-5 mb-4">
        <h3 className="text-sm font-semibold mb-3">Create a new key</h3>
        <CreateApiKeyForm />
      </div>

      {keys.length > 0 && (
        <div className="rounded-lg border border-border bg-background divide-y divide-border">
          {keys.map((k) => (
            <div key={k.id} className="flex items-center justify-between p-3 text-sm">
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
      )}

      {keys.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <Key className="size-8 mx-auto text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">No API keys yet. Create one above.</p>
        </div>
      )}
    </div>
  );
}
