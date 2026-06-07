import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";

export default function AuthErrorPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Authentication error
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Something went wrong. Please try again.
          </p>
          <Link
            href="/auth/signin"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-foreground px-6 text-sm font-medium text-background hover:bg-foreground/90 transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </main>
    </>
  );
}
