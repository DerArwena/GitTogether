"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createJoinRequest(projectId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const existing = await db.joinRequest.findUnique({
    where: {
      projectId_userId: { projectId, userId: session.user.id },
    },
  });

  if (existing) throw new Error("Join request already exists");

  await db.joinRequest.create({
    data: {
      projectId,
      userId: session.user.id,
      message: (formData.get("message") as string) || null,
    },
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function approveJoinRequest(requestId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const request = await db.joinRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) throw new Error("Request not found");

  const member = await db.projectMember.findUnique({
    where: {
      projectId_userId: { projectId: request.projectId, userId: session.user.id },
    },
  });

  if (!member || !["owner", "admin"].includes(member.role)) {
    throw new Error("Forbidden");
  }

  await db.$transaction([
    db.projectMember.create({
      data: {
        projectId: request.projectId,
        userId: request.userId,
        role: "member",
      },
    }),
    db.joinRequest.update({
      where: { id: requestId },
      data: { status: "approved", reviewedById: session.user.id, reviewedAt: new Date() },
    }),
  ]);

  revalidatePath(`/projects/${request.projectId}/requests`);
}

export async function denyJoinRequest(requestId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const request = await db.joinRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) throw new Error("Request not found");

  const member = await db.projectMember.findUnique({
    where: {
      projectId_userId: { projectId: request.projectId, userId: session.user.id },
    },
  });

  if (!member || !["owner", "admin"].includes(member.role)) {
    throw new Error("Forbidden");
  }

  await db.joinRequest.update({
    where: { id: requestId },
    data: { status: "denied", reviewedById: session.user.id, reviewedAt: new Date() },
  });

  revalidatePath(`/projects/${request.projectId}/requests`);
}
