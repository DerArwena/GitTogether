"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateMemberRole(
  projectId: string,
  memberId: string,
  newRole: string
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const currentMember = await db.projectMember.findUnique({
    where: {
      projectId_userId: { projectId, userId: session.user.id },
    },
  });

  if (!currentMember || !["owner", "admin"].includes(currentMember.role)) {
    throw new Error("Forbidden");
  }

  if (currentMember.role !== "owner" && newRole === "owner") {
    throw new Error("Only the owner can transfer ownership");
  }

  await db.projectMember.update({
    where: { id: memberId },
    data: { role: newRole as any },
  });

  revalidatePath(`/projects/${projectId}/members`);
}

export async function removeMember(projectId: string, memberId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const currentMember = await db.projectMember.findUnique({
    where: {
      projectId_userId: { projectId, userId: session.user.id },
    },
  });

  if (!currentMember || !["owner", "admin"].includes(currentMember.role)) {
    throw new Error("Forbidden");
  }

  await db.projectMember.delete({ where: { id: memberId } });
  revalidatePath(`/projects/${projectId}/members`);
}

export async function leaveProject(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const member = await db.projectMember.findUnique({
    where: {
      projectId_userId: { projectId, userId: session.user.id },
    },
  });

  if (!member) throw new Error("Not a member");
  if (member.role === "owner") throw new Error("Owner cannot leave");

  await db.projectMember.delete({ where: { id: member.id } });
  revalidatePath("/dashboard");
}
