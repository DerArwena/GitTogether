import { redirect } from "next/navigation";
import { acceptInvite } from "@/server/actions/invite";
import { Navbar } from "@/components/layout/navbar";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  return (
    <>
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Join project
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            You&apos;ve been invited to join a project on GitTogether.
          </p>
          <form
            action={async () => {
              "use server";
              await acceptInvite(code);
            }}
            className="mt-8"
          >
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-foreground px-6 text-sm font-medium text-background hover:bg-foreground/90 transition-colors"
            >
              Accept invite
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
