"use client";

import { Button } from "@/components/ui/button";
import { revokeSession } from "@/server/actions/session";

interface Props {
  sessionId: string;
}

export function RevokeSessionButton({ sessionId }: Props) {
  return (
    <form action={revokeSession.bind(null, sessionId)}>
      <Button type="submit" variant="ghost" size="sm" className="text-destructive text-xs">
        Revoke
      </Button>
    </form>
  );
}
