import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/navbar";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-6">
        <div className="text-center max-w-xs">
          <div className="flex justify-center mb-4">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <FileQuestion className="size-6 text-muted-foreground" />
            </div>
          </div>
          <h2 className="text-lg font-semibold mb-1">Page not found</h2>
          <p className="text-sm text-muted-foreground mb-6">
            The page you are looking for does not exist or has been moved.
          </p>
          <Link href="/">
            <Button>Go home</Button>
          </Link>
        </div>
      </main>
    </>
  );
}
