import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ArrowLeft, Bell } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NotificationToggles } from "@/components/settings/notification-toggles";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  const prefs = await db.notificationPreference.findUnique({
    where: { userId: session.user.id },
  });

  const defaults = {
    emailJoinRequests: true,
    emailInvites: true,
    emailActivity: false,
    emailDigest: false,
  };

  return (
    <div className="p-6 max-w-lg">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/settings">
          <Button variant="ghost" size="icon" className="size-8">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Notifications</h1>
          <p className="text-sm text-muted-foreground">Notification preferences</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-background p-5">
        <h3 className="text-sm font-semibold mb-4">Email notifications</h3>
        <NotificationToggles prefs={prefs ?? defaults} />
      </div>
    </div>
  );
}
