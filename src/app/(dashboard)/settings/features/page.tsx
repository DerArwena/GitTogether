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
    <div className="p-6 lg:p-8 max-w-lg">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="size-8 rounded-lg">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Features</h1>
          <p className="text-sm text-muted-foreground">Feature toggles and preferences</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex size-8 items-center justify-center rounded-lg bg-chart-4/10">
            <ToggleLeft className="size-4 text-chart-4" />
          </div>
          <h3 className="text-sm font-semibold">Feature flags</h3>
        </div>
        {flags.length > 0 ? (
          <div className="space-y-4">
            {flags.map((flag) => (
              <FeatureToggle key={flag.id} flag={flag} />
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <ToggleLeft className="size-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-4">No feature flags yet.</p>
            <form action={seedFeatureFlags}>
              <Button type="submit" size="sm" variant="outline" className="gap-1.5">
                <RefreshCw className="size-3.5" />
                Load defaults
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
