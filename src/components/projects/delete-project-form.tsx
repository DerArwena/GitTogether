"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteProject } from "@/server/actions/project";

interface Props {
  projectId: string;
}

export function DeleteProjectForm({ projectId }: Props) {
  return (
    <form
      action={deleteProject.bind(null, projectId)}
      onSubmit={(e) => {
        if (!confirm("Are you sure you want to delete this project?")) {
          e.preventDefault();
        }
      }}
    >
      <Button type="submit" variant="destructive" size="sm">
        <Trash2 className="size-3.5 mr-1.5" />
        Delete project
      </Button>
    </form>
  );
}
