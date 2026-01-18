"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";

export async function getTeachers(search?: string) {
  const where: Prisma.TeacherWhereInput = search
    ? {
        OR: [
          { fullName: { contains: search, mode: "insensitive" } },
          { teacherId: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  return await prisma.teacher.findMany({
    where,
    include: {
      subjects: true,
      sections: {
        include: {
          class: true,
        },
      }, // ClassTeacher relation
    },
    orderBy: { fullName: "asc" },
  });
}

export async function getTeacherById(id: string) {
  return await prisma.teacher.findUnique({
    where: { id },
    include: {
      subjects: true,
      sections: {
        include: { class: true },
      },
      attendance: {
        orderBy: { date: "desc" },
        take: 30,
      },
    },
  });
}
