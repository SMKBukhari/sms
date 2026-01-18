"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { hashPassword, createSession } from "@/lib/auth"; // If we want to auto-login? No, admin creates.
import { Role, Gender } from "@/generated/prisma/enums";
import { redirect } from "next/navigation";

const createStudentSchema = z.object({
  fullName: z.string().min(3),
  admissionNo: z.string().min(1),
  rollNo: z.string().min(1),
  classId: z.string().min(1),
  sectionId: z.string().optional(),
  dob: z.string(), // ISO Date string
  gender: z.nativeEnum(Gender),
  password: z.string().min(6), // Initial password
});

export async function createStudent(formData: FormData) {
  const data = Object.fromEntries(formData.entries());

  // Transform date to string if needed, or Zod will handle if formatted correctly
  // formData.get("dob") is "YYYY-MM-DD" usually.

  const parseResult = createStudentSchema.safeParse(data);
  if (!parseResult.success) {
    throw new Error(
      "Invalid input: " +
        parseResult.error.issues.map((i) => i.message).join(", "),
    );
  }

  const {
    fullName,
    admissionNo,
    rollNo,
    classId,
    sectionId,
    dob,
    gender,
    password,
  } = parseResult.data;

  // Check unique admissionNo
  const existing = await prisma.student.findUnique({ where: { admissionNo } });
  if (existing) {
    throw new Error("Admission Number already exists");
  }

  // Check unique username (using admissionNo as username usually, or name)
  // Let's use admissionNo as username for uniqueness
  const username = admissionNo;

  const hashedPassword = await hashPassword(password);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        username,
        password: hashedPassword,
        role: Role.STUDENT,
      },
    });

    await tx.student.create({
      data: {
        userId: user.id,
        fullName,
        admissionNo,
        rollNo,
        classId,
        sectionId: sectionId || undefined, // Handle empty string
        dob: new Date(dob),
        gender,
        admissionDate: new Date(),
        // Default account
        account: {
          create: {
            balance: 0,
          },
        },
      },
    });
  });

  redirect("/students");
}
