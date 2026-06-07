"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

export async function createApiKey(name: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const key = `gt_${crypto.randomBytes(24).toString("hex")}`;

  await db.apiKey.create({
    data: { name, key, userId: session.user.id },
  });

  revalidatePath("/settings/api-keys");
  return key;
}

export async function revokeApiKey(keyId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.apiKey.deleteMany({
    where: { id: keyId, userId: session.user.id },
  });

  revalidatePath("/settings/api-keys");
}
