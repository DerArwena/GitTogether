import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ArrowLeft, ToggleLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { seedFeatureFlags } from "@/server/actions/feature";
import { FeatureToggle } from "@/components/settings/feature-toggle";

export default async function FeaturesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const flags = await db.featureFlag.findMany({
    orderBy: { createdAt: "asc" },
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
          <h1 className="text-xl font-semibold tracking-tight">Features</h1>
          <p className="text-sm text-muted-foreground">Feature toggles and preferences</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background p-5 mb-4">
        <h3 className="text-sm font-semibold mb-3">Feature flags</h3>
        {flags.length > 0 ? (
          <div className="space-y-3">
            {flags.map((flag) => (
              <FeatureToggle key={flag.id} flag={flag} />
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <ToggleLeft className="size-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-3">No feature flags yet.</p>
            <form action={seedFeatureFlags}>
              <Button type="submit" size="sm" variant="outline">
                <RefreshCw className="size-3.5 mr-1.5" />
                Load defaults
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
