"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import {
  Bell,
  Search,
  ChevronDown,
  Settings,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Topbar({ notificationCount = 0 }: { notificationCount?: number }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-background px-6">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Search projects..."
          className="w-full h-8 rounded-md border border-border bg-accent/30 pl-8 pr-3 text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:bg-background focus:border-foreground/20 transition-all"
        />
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="relative flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
          aria-label="Toggle theme"
        >
          {mounted && theme === "dark" ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
        </button>

        <button className="relative flex size-7 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
          <Bell className="size-3.5" />
            {notificationCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 size-3.5 rounded-full bg-foreground text-[7px] font-bold text-background flex items-center justify-center">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md px-1.5 py-1 hover:bg-accent transition-all">
            <Avatar className="size-6">
              <AvatarFallback className="text-[9px] bg-accent text-muted-foreground">
                {session?.user?.name?.[0] ?? session?.user?.email?.[0] ?? "U"}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs hidden sm:inline text-foreground font-medium max-w-[120px] truncate">
              {session?.user?.name ?? session?.user?.email}
            </span>
            <ChevronDown className="size-2.5 text-muted-foreground hidden sm:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-[11px] text-muted-foreground font-normal truncate">
                {session?.user?.email}
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings")} className="text-xs gap-2">
              <Settings className="size-3.5" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-xs gap-2 text-destructive focus:text-destructive"
            >
              <LogOut className="size-3.5" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
