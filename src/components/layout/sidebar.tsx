"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FolderKanban,
  BarChart3,
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
  GitPullRequest,
  GitFork,
  Users,
} from "lucide-react";
import { useState } from "react";

const navGroups = [
  {
    section: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Activity", href: "/activity", icon: Activity },
    ],
  },
  {
    section: "Development",
    items: [
      { label: "Projects", href: "/projects", icon: FolderKanban },
      { label: "Repositories", href: "/repositories", icon: GitFork },
      { label: "Pull Requests", href: "/pulls", icon: GitPullRequest },
    ],
  },
  {
    section: "Workspace",
    items: [
      { label: "Team", href: "/team", icon: Users },
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
    ],
  },
  {
    section: "Administration",
    items: [
      { label: "Admin", href: "/admin", icon: Shield },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    if (href === "/activity") return pathname === "/activity";
    if (href === "/repositories") return pathname === "/repositories";
    if (href === "/pulls") return pathname === "/pulls";
    if (href === "/team") return pathname === "/team";
    if (href === "/projects") return pathname.startsWith("/projects");
    if (href === "/analytics") return pathname.startsWith("/analytics");
    if (href === "/admin") return pathname.startsWith("/admin");
    if (href === "/settings") return pathname.startsWith("/settings");
    return false;
  }

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-sidebar transition-all duration-300",
        collapsed ? "w-14" : "w-56"
      )}
    >
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex size-7 items-center justify-center rounded-md bg-foreground text-background text-xs font-bold shrink-0">
          G
        </div>
        <span className={cn("font-semibold tracking-tight", collapsed && "hidden")}>
          GitTogether
        </span>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "flex size-6 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-all ml-auto shrink-0",
            collapsed && "mx-auto"
          )}
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {navGroups.map((group) => (
          <div key={group.section}>
            {!collapsed && (
              <p className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                {group.section}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-all duration-150",
                      active
                        ? "bg-accent font-medium text-accent-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                      collapsed && "justify-center px-2"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-0.5 rounded-full bg-foreground" />
                    )}
                    <item.icon className="size-4 shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <div className={cn(
          "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground",
          collapsed && "justify-center px-0"
        )}>
          <span className="size-1.5 rounded-full bg-green-500 shrink-0" />
          {!collapsed && <span>v0.2.0</span>}
        </div>
      </div>
    </aside>
  );
}
