"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createClassSchema = z.object({
  name: z.string().min(1),
});

const createSectionSchema = z.object({
  name: z.string().min(1),
  classId: z.string().min(1),
  capacity: z.coerce.number().min(1),
});

export async function createClass(formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  const { name } = createClassSchema.parse(data);

  await prisma.class.create({ data: { name } });
  revalidatePath("/settings");
}

export async function createSection(formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  const { name, classId, capacity } = createSectionSchema.parse(data);

  await prisma.section.create({
    data: {
      name,
      classId,
      capacity,
    },
  });
  revalidatePath("/settings");
}

export async function getAcademicSettings() {
  const classes = await prisma.class.findMany({
    include: {
      sections: true,
    },
    orderBy: { name: "asc" },
  });
  return { classes };
}

export async function getSystemSettings() {
  const settings = await prisma.systemSetting.findMany();
  // Convert array to object
  const settingsMap: Record<string, string> = {};
  settings.forEach((s) => {
    settingsMap[s.key] = s.value;
  });
  return settingsMap;
}

export async function updateSystemSettings(formData: FormData) {
  const data = Object.fromEntries(formData.entries());

  // Upsert each key
  await prisma.$transaction(async (tx) => {
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === "string" && value.trim() !== "") {
        await tx.systemSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      }
    }
  });

  revalidatePath("/settings");
}
