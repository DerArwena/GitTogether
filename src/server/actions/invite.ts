"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function generateCode(): string {
  return Math.random().toString(36).substring(2, 10);
}

export async function createInvite(projectId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const member = await db.projectMember.findUnique({
    where: {
      projectId_userId: { projectId, userId: session.user.id },
    },
  });

  if (!member || !["owner", "admin", "maintainer"].includes(member.role)) {
    throw new Error("Forbidden");
  }

  const roleValue = formData.get("role") as string;
  const validRoles = ["owner", "admin", "maintainer", "member", "viewer"] as const;
  const role = validRoles.includes(roleValue as any) ? (roleValue as any) : "member";

  await db.invite.create({
    data: {
      code: generateCode(),
      projectId,
      role,
      maxUses: formData.get("maxUses")
        ? parseInt(formData.get("maxUses") as string)
        : null,
      expiresAt: formData.get("expiresAt")
        ? new Date(formData.get("expiresAt") as string)
        : null,
      createdById: session.user.id,
    },
  });

  revalidatePath(`/projects/${projectId}/settings`);
}

export async function acceptInvite(code: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const invite = await db.invite.findUnique({ where: { code } });
  if (!invite) throw new Error("Invite not found");

  if (invite.expiresAt && invite.expiresAt < new Date()) {
    throw new Error("Invite has expired");
  }

  if (invite.maxUses && invite.usedCount >= invite.maxUses) {
    throw new Error("Invite has reached maximum uses");
  }

  const existingMember = await db.projectMember.findUnique({
    where: {
      projectId_userId: {
        projectId: invite.projectId,
        userId: session.user.id,
      },
    },
  });

  if (existingMember) {
    redirect(`/projects/${existingMember.projectId}`);
    return;
  }

  await db.$transaction([
    db.projectMember.create({
      data: {
        projectId: invite.projectId,
        userId: session.user.id,
        role: invite.role,
      },
    }),
    db.invite.update({
      where: { id: invite.id },
      data: { usedCount: { increment: 1 } },
    }),
  ]);

  const project = await db.project.findUnique({
    where: { id: invite.projectId },
    select: { slug: true },
  });

  revalidatePath("/dashboard");
  redirect(`/projects/${project?.slug}`);
}
