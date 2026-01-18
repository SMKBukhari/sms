"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- CLASSES ---

export async function getClasses() {
  try {
    return await prisma.class.findMany({
      include: {
        _count: {
          select: { sections: true, students: true, subjects: true },
        },
      },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Failed to fetch classes:", error);
    return [];
  }
}

export async function createClass(name: string) {
  try {
    await prisma.class.create({ data: { name } });
    revalidatePath("/settings/academic/classes");
    return { success: true, message: "Class created successfully" };
  } catch (error) {
    return { success: false, message: "Failed to create class" };
  }
}

export async function updateClass(id: string, name: string) {
  try {
    await prisma.class.update({ where: { id }, data: { name } });
    revalidatePath("/settings/academic/classes");
    return { success: true, message: "Class updated successfully" };
  } catch (error) {
    return { success: false, message: "Failed to update class" };
  }
}

export async function deleteClass(id: string) {
  try {
    await prisma.class.delete({ where: { id } });
    revalidatePath("/settings/academic/classes");
    return { success: true, message: "Class deleted successfully" };
  } catch (error) {
    return { success: false, message: "Failed to delete class" };
  }
}

// --- SECTIONS ---

export async function getSections() {
  try {
    return await prisma.section.findMany({
      include: {
        class: true,
        _count: { select: { students: true } },
      },
      orderBy: [{ class: { name: "asc" } }, { name: "asc" }],
    });
  } catch (error) {
    console.error("Failed to fetch sections:", error);
    return [];
  }
}

export async function createSection(data: {
  name: string;
  classId: string;
  capacity: number;
}) {
  try {
    await prisma.section.create({
      data: {
        name: data.name,
        classId: data.classId,
        capacity: data.capacity,
      },
    });
    revalidatePath("/settings/academic/sections");
    return { success: true, message: "Section created successfully" };
  } catch (error) {
    return { success: false, message: "Failed to create section" };
  }
}

export async function deleteSection(id: string) {
  try {
    await prisma.section.delete({ where: { id } });
    revalidatePath("/settings/academic/sections");
    return { success: true, message: "Section deleted successfully" };
  } catch (error) {
    return { success: false, message: "Failed to delete section" };
  }
}

// --- SUBJECTS ---

export async function getSubjects() {
  try {
    return await prisma.subject.findMany({
      include: {
        _count: { select: { classes: true, teachers: true } },
      },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("Failed to fetch subjects:", error);
    return [];
  }
}

export async function createSubject(name: string, code?: string) {
  try {
    await prisma.subject.create({ data: { name, code } });
    revalidatePath("/settings/academic/subjects");
    return { success: true, message: "Subject created successfully" };
  } catch (error) {
    return { success: false, message: "Failed to create subject" };
  }
}

export async function deleteSubject(id: string) {
  try {
    await prisma.subject.delete({ where: { id } });
    revalidatePath("/settings/academic/subjects");
    return { success: true, message: "Subject deleted successfully" };
  } catch (error) {
    return { success: false, message: "Failed to delete subject" };
  }
}

export async function assignSubjectToClass(
  subjectId: string,
  classIds: string[],
) {
  try {
    // First disconnect all, then connect selected (simplest sync approach)
    // Note: This is destructive if not careful, but for this simple requirement it works.
    // A better approach is to calc diff, but Prisma set/connect covers us.

    await prisma.subject.update({
      where: { id: subjectId },
      data: {
        classes: {
          set: classIds.map((id) => ({ id })),
        },
      },
    });
    revalidatePath("/settings/academic/subjects");
    return { success: true, message: "Subject assignments updated" };
  } catch (error) {
    return { success: false, message: "Failed to assign subject" };
  }
}
