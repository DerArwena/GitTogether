"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function revokeSession(sessionId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.session.deleteMany({
    where: { id: sessionId, userId: session.user.id },
  });

  revalidatePath("/settings/security");
}
