"use client";

import { useOptimistic, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { updateNotificationPrefs } from "@/server/actions/notifications";

interface Props {
  prefs: {
    emailJoinRequests: boolean;
    emailInvites: boolean;
    emailActivity: boolean;
    emailDigest: boolean;
  };
}

const labels: Record<keyof Props["prefs"], string> = {
  emailJoinRequests: "Join request notifications",
  emailInvites: "Invite notifications",
  emailActivity: "Project activity updates",
  emailDigest: "Weekly digest email",
};

const descriptions: Record<keyof Props["prefs"], string> = {
  emailJoinRequests: "Get emails when someone requests to join your projects",
  emailInvites: "Get emails when you receive a project invite",
  emailActivity: "Get emails about activity in your projects",
  emailDigest: "Receive a weekly summary of all project activity",
};

export function NotificationToggles({ prefs }: Props) {
  const [isPending, startTransition] = useTransition();
  const [optimisticPrefs, setOptimisticPrefs] = useOptimistic(prefs);

  async function toggle(key: keyof Props["prefs"]) {
    const next = !optimisticPrefs[key];
    const fd = new FormData();
    fd.set("emailJoinRequests", String(key === "emailJoinRequests" ? next : optimisticPrefs.emailJoinRequests));
    fd.set("emailInvites", String(key === "emailInvites" ? next : optimisticPrefs.emailInvites));
    fd.set("emailActivity", String(key === "emailActivity" ? next : optimisticPrefs.emailActivity));
    fd.set("emailDigest", String(key === "emailDigest" ? next : optimisticPrefs.emailDigest));

    startTransition(async () => {
      setOptimisticPrefs({ ...optimisticPrefs, [key]: next });
      await updateNotificationPrefs(fd);
    });
  }

  return (
    <div className="space-y-4">
      {(Object.keys(labels) as Array<keyof Props["prefs"]>).map((key) => (
        <div key={key} className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{labels[key]}</p>
            <p className="text-xs text-muted-foreground">{descriptions[key]}</p>
          </div>
          <Switch
            checked={optimisticPrefs[key]}
            onCheckedChange={() => toggle(key)}
            disabled={isPending}
          />
        </div>
      ))}
    </div>
  );
}
