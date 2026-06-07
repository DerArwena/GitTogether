"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, Loader2, Globe, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getUserRepos, linkRepo } from "@/server/actions/repo";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Props {
  projectId: string;
}

interface Repo {
  id: number;
  fullName: string;
  htmlUrl: string;
  private: boolean;
}

export function RepoLinkForm({ projectId }: Props) {
  const router = useRouter();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Repo | null>(null);
  const [customUrl, setCustomUrl] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getUserRepos()
      .then(setRepos)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const repos = await getUserRepos();
      setRepos(repos);
      toast.success(`${repos.length} repos loaded`);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to refresh repos");
    } finally {
      setRefreshing(false);
    }
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return repos;
    const q = query.toLowerCase();
    return repos.filter((r) => r.fullName.toLowerCase().includes(q));
  }, [repos, query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const hasCustom = customUrl.length > 0 || (query.trim().startsWith("http") && !selected);

  const handleSelect = useCallback((repo: Repo) => {
    setSelected(repo);
    setQuery(repo.fullName);
    setCustomUrl("");
    setShowDropdown(false);
    inputRef.current?.blur();
  }, []);

  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
    setSelected(null);
    setShowDropdown(true);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const url = selected?.htmlUrl || customUrl;
      if (!url) return;
      setSubmitting(true);
      const fd = new FormData();
      fd.set("repoUrl", url);
      try {
        await linkRepo(projectId, fd);
        toast.success("Repository linked");
        setQuery("");
        setSelected(null);
        setCustomUrl("");
        router.refresh();
      } catch (err: any) {
        toast.error(err.message ?? "Failed to link repository");
      } finally {
        setSubmitting(false);
      }
    },
    [projectId, selected, customUrl, router]
  );

  const showNoResults = showDropdown && query.trim() && !loading && filtered.length === 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-2" ref={containerRef}>
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            placeholder="Search your repos or paste a URL…"
            className={cn(
              "h-8 w-full rounded-lg border border-input bg-transparent pl-7 pr-2.5 py-1 text-sm outline-none",
              "transition-colors",
              "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              "placeholder:text-muted-foreground"
            )}
          />
          {showDropdown && (query.trim() || loading) && (
            <div className="absolute top-full mt-1 left-0 right-0 z-50 max-h-60 overflow-y-auto rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 p-1">
              {loading ? (
                <div className="flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground">
                  <Loader2 className="size-3 animate-spin" />
                  Loading repos…
                </div>
              ) : (
                <>
                  {filtered.map((repo) => (
                    <button
                      key={repo.id}
                      type="button"
                      onClick={() => handleSelect(repo)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md py-1.5 px-2 text-sm text-left",
                        "hover:bg-accent hover:text-accent-foreground transition-colors",
                        selected?.id === repo.id && "bg-accent text-accent-foreground"
                      )}
                    >
                      <span className="flex-1 truncate">{repo.fullName}</span>
                      {repo.private && (
                        <span className="text-[10px] text-muted-foreground border border-border rounded px-1 leading-tight whitespace-nowrap">Private</span>
                      )}
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
          {showNoResults && (
            <div className="absolute top-full mt-1 left-0 right-0 z-50 rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 p-1">
              <div className="flex flex-col items-center gap-1 py-3 text-xs text-muted-foreground">
                <Globe className="size-4" />
                <span>No repos found matching &ldquo;{query}&rdquo;</span>
                <span className="text-[11px]">Paste a full URL below and click Link repo</span>
              </div>
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          onClick={handleRefresh}
          disabled={refreshing}
          title="Refresh repo list"
        >
          <RefreshCw className={cn("size-3.5", refreshing && "animate-spin")} />
        </Button>
        <Button type="submit" size="sm" disabled={(!selected && !customUrl) || submitting}>
          {submitting ? <Loader2 className="size-3.5 animate-spin" /> : "Link repo"}
        </Button>
      </div>
      {hasCustom && (
        <Input
          value={customUrl}
          onChange={(e) => setCustomUrl(e.target.value)}
          placeholder="https://github.com/owner/repo"
        />
      )}
    </form>
  );
}
