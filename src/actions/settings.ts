"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSystemSettings(keys: string[]) {
  const settings = await prisma.systemSetting.findMany({
    where: {
      key: { in: keys },
    },
  });

  // Convert array to object for easier usage
  const settingsMap: Record<string, string> = {};
  settings.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  return settingsMap;
}

export async function updateSystemSettings(settings: Record<string, string>) {
  try {
    const updates = Object.entries(settings).map(async ([key, value]) => {
      return prisma.systemSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    });

    await Promise.all(updates);
    revalidatePath("/settings"); // Revalidate settings pages
    return { success: true };
  } catch (error) {
    console.error("Failed to update settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}
