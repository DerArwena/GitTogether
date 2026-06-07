"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    || "project";
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let attempt = 0;
  while (await db.project.findUnique({ where: { slug } })) {
    attempt++;
    slug = `${base}-${attempt}`;
  }
  return slug;
}

const createProjectSchema = z.object({
  name: z.string().min(1).max(64),
  description: z.string().max(500).optional(),
  websiteUrl: z.string().url().max(500).optional().or(z.literal("")),
  isPublic: z.boolean().optional().default(true),
});

export async function createProject(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const rawName = formData.get("name") as string | null;

  const parsed = createProjectSchema.parse({
    name: rawName,
    description: formData.get("description") || undefined,
    websiteUrl: formData.get("websiteUrl") || undefined,
    isPublic: formData.get("isPublic") === "true",
  });

  const slug = slugify(parsed.name);
  const finalSlug = await uniqueSlug(slug);

  const project = await db.project.create({
    data: {
      ...parsed,
      slug: finalSlug,
      ownerId: session.user.id,
      members: {
        create: {
          userId: session.user.id,
          role: "owner",
        },
      },
    },
  });

  revalidatePath("/dashboard");
  redirect(`/projects/${project.slug}`);
}

const updateProjectSchema = z.object({
  name: z.string().min(1).max(64).optional(),
  description: z.string().max(500).optional(),
  websiteUrl: z.string().url().max(500).optional().or(z.literal("")),
  isPublic: z.boolean().optional(),
});

export async function updateProject(projectId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const member = await db.projectMember.findUnique({
    where: {
      projectId_userId: { projectId, userId: session.user.id },
    },
  });

  if (!member || !["owner", "admin"].includes(member.role)) {
    throw new Error("Forbidden");
  }

  const parsed = updateProjectSchema.parse({
    name: formData.get("name") || undefined,
    description: formData.get("description") || undefined,
    websiteUrl: formData.get("websiteUrl") || undefined,
    isPublic: formData.get("isPublic") === "true" || undefined,
  });

  await db.project.update({
    where: { id: projectId },
    data: parsed,
  });

  revalidatePath(`/projects/${formData.get("slug")}`);
}

export async function deleteProject(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const project = await db.project.findUnique({
    where: { id: projectId },
  });

  if (!project || project.ownerId !== session.user.id) {
    throw new Error("Forbidden");
  }

  await db.project.delete({ where: { id: projectId } });
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
