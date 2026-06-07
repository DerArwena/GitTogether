import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  return (
    <>
      <Navbar />
      <main className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-lg">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Your account settings.
          </p>

          <div className="mt-8 space-y-6">
            <div className="rounded-lg border border-border p-5">
              <h2 className="text-sm font-semibold">Profile</h2>
              <div className="mt-3 space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Name: </span>
                  {session.user.name ?? "Not set"}
                </p>
                <p>
                  <span className="text-muted-foreground">Email: </span>
                  {session.user.email}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
