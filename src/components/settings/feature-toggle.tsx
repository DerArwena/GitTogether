"use client";

import { useOptimistic, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { toggleFeature } from "@/server/actions/feature";

interface Flag {
  id: string;
  key: string;
  name: string;
  description: string | null;
  enabled: boolean;
}

interface Props {
  flag: Flag;
}

export function FeatureToggle({ flag }: Props) {
  const [isPending, startTransition] = useTransition();
  const [optimisticEnabled, setOptimisticEnabled] = useOptimistic(flag.enabled);

  async function handleChange(checked: boolean) {
    const fd = new FormData();
    fd.set("flagId", flag.id);
    fd.set("enabled", String(checked));

    startTransition(async () => {
      setOptimisticEnabled(checked);
      await toggleFeature(fd);
    });
  }

  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium">{flag.name}</p>
        {flag.description && (
          <p className="text-xs text-muted-foreground">{flag.description}</p>
        )}
      </div>
      <Switch
        checked={optimisticEnabled}
        onCheckedChange={handleChange}
        disabled={isPending}
      />
    </div>
  );
}
