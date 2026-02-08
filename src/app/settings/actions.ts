"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { updateProfileSchema } from "@/lib/validations/auth";

export async function updateProfile(formData: FormData) {
  const user = await requireAuth();

  const raw = {
    displayName: (formData.get("displayName") as string) || undefined,
    avatarUrl: (formData.get("avatarUrl") as string) || undefined,
    bio: (formData.get("bio") as string) || undefined,
  };

  const result = updateProfileSchema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0].message };
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        displayName: result.data.displayName ?? null,
        avatarUrl: result.data.avatarUrl ?? null,
        bio: result.data.bio ?? null,
      },
    });
  } catch {
    return { error: "Failed to update profile. Please try again." };
  }

  revalidatePath("/settings");
  return { success: true };
}
