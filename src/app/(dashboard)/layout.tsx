import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  let notificationCount = 0;
  if (session?.user?.id) {
    const memberships = await db.projectMember.findMany({
      where: { userId: session.user.id },
      select: { projectId: true },
    });
    const projectIds = memberships.map((m) => m.projectId);
    if (projectIds.length > 0) {
      notificationCount = await db.joinRequest.count({
        where: { projectId: { in: projectIds }, status: "pending" },
      });
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar notificationCount={notificationCount} />
        <main className="flex-1 overflow-y-auto bg-muted/40">
          {children}
        </main>
      </div>
    </div>
  );
}
