"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function toggleFeature(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const flagId = formData.get("flagId") as string;
  const enabled = formData.get("enabled") === "true";

  await db.featureFlag.update({
    where: { id: flagId },
    data: { enabled },
  });

  revalidatePath("/settings/features");
}

export async function seedFeatureFlags() {
  const session = await auth();
  if (!session?.user?.id) return;

  const defaults = [
    { key: "dark_mode", name: "Dark mode", description: "Toggle dark mode theme across the app", enabled: true },
    { key: "beta_analytics", name: "Beta analytics", description: "Enable experimental analytics charts", enabled: false },
    { key: "auto_issue_sync", name: "Auto issue sync", description: "Automatically sync GitHub issues every hour", enabled: false },
    { key: "email_digest", name: "Email digest", description: "Receive weekly email digest of project activity", enabled: true },
    { key: "advanced_permissions", name: "Advanced permissions", description: "Enable fine-grained permission controls", enabled: false },
  ];

  for (const flag of defaults) {
    await db.featureFlag.upsert({
      where: { key: flag.key },
      create: { ...flag, userId: session.user.id },
      update: {},
    });
  }

  revalidatePath("/settings/features");
}
