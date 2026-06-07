"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateNotificationPrefs(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const data = {
    emailJoinRequests: formData.get("emailJoinRequests") === "true",
    emailInvites: formData.get("emailInvites") === "true",
    emailActivity: formData.get("emailActivity") === "true",
    emailDigest: formData.get("emailDigest") === "true",
  };

  await db.notificationPreference.upsert({
    where: { userId: session.user.id },
    create: { ...data, userId: session.user.id },
    update: data,
  });

  revalidatePath("/settings/notifications");
}
