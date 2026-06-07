import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export type Role = "owner" | "admin" | "maintainer" | "member" | "viewer";

const ROLE_HIERARCHY: Record<Role, number> = {
  viewer: 0,
  member: 1,
  maintainer: 2,
  admin: 3,
  owner: 4,
};

export function roleGte(userRole: Role, minimumRole: Role): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole];
}

export async function getProjectRole(
  projectId: string,
  userId: string
): Promise<Role | null> {
  const member = await db.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  return member?.role as Role | null;
}

export async function requireRole(
  projectId: string,
  minimumRole: Role
): Promise<{ authorized: boolean; role: Role | null }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { authorized: false, role: null };
  }

  const role = await getProjectRole(projectId, session.user.id);
  if (!role) {
    return { authorized: false, role: null };
  }

  return { authorized: roleGte(role, minimumRole), role };
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user;
}
