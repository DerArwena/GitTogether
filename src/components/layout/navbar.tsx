"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link
          href={session ? "/dashboard" : "/"}
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <div className="flex size-7 items-center justify-center rounded-lg bg-foreground text-background text-xs font-bold">
            G
          </div>
          GitTogether
        </Link>

        <nav className="flex items-center gap-3">
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <span className="text-sm text-muted-foreground">·</span>
              <Link
                href="/settings"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Settings
              </Link>
              <div className="flex items-center gap-3 pl-3 border-l border-border">
                <span className="text-sm text-muted-foreground">
                  {session.user?.name ?? session.user?.email}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="gap-1.5"
                >
                  <LogOut className="size-3.5" />
                  Sign out
                </Button>
              </div>
            </>
          ) : (
            <Link href="/auth/signin">
              <Button size="sm">Sign in</Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
