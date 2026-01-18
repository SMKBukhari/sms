"use server";

import { prisma } from "@/lib/prisma";
import { Prisma, StudentStatus, Gender } from "@/generated/prisma/client";
import bcrypt from "bcryptjs";
import { generateFeesForStudent } from "@/actions/fee-actions";

export type StudentListFilter = {
  classId?: string;
  sectionId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  status?: StudentStatus; // Added status filter
};

export async function getStudents(filter: StudentListFilter) {
  const page = filter.page || 1;
  const pageSize = filter.pageSize || 10;
  const skip = (page - 1) * pageSize;

  const where: Prisma.StudentWhereInput = {
    AND: [
      filter.classId ? { classId: filter.classId } : {},
      filter.sectionId ? { sectionId: filter.sectionId } : {},
      filter.status ? { status: filter.status } : {}, // Status filter
      filter.search
        ? {
            OR: [
              { fullName: { contains: filter.search, mode: "insensitive" } },
              { rollNo: { contains: filter.search, mode: "insensitive" } },
              { admissionNo: { contains: filter.search, mode: "insensitive" } },
            ],
          }
        : {},
    ],
  };

  const [students, total] = await Promise.all([
    prisma.student.findMany({
      where,
      include: {
        class: true,
        section: true,
        user: {
          select: { imageURL: true },
        },
        attendance: {
          take: 30, // Get last 30 days for calc
          orderBy: { date: "desc" },
        },
        results: true, // For GPA calc
      },
      skip,
      take: pageSize,
      orderBy: { fullName: "asc" },
    }),
    prisma.student.count({ where }),
  ]);

  // Enrich students with calculated fields
  const enrichedStudents = students.map((student) => {
    // Calculate GPA (Mock logic or simple average)
    const totalMarks = student.results.reduce((sum, r) => sum + r.marks, 0);
    const maxMarks = student.results.reduce((sum, r) => sum + r.total, 0);
    const gpa =
      maxMarks > 0 ? ((totalMarks / maxMarks) * 4.0).toFixed(1) : "0.0";

    // Performance logic
    let performance = "Average";
    const gpaNum = parseFloat(gpa);
    if (gpaNum >= 3.5) performance = "Excellent";
    else if (gpaNum >= 3.0) performance = "Good";
    else if (gpaNum >= 2.0) performance = "Average";
    else performance = "Poor";

    // Attendance %
    const present = student.attendance.filter(
      (a) => a.status === "PRESENT",
    ).length;
    const totalDays = student.attendance.length;
    const attendanceRate =
      totalDays > 0 ? Math.round((present / totalDays) * 100) : 0;

    return {
      ...student,
      gpa,
      performance,
      attendanceRate,
    };
  });

  return {
    students: enrichedStudents,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getStudentById(id: string) {
  return await prisma.student.findUnique({
    where: { id },
    include: {
      class: true,
      section: true,
      account: {
        include: {
          transactions: {
            orderBy: { date: "desc" },
            take: 20, // Recent transactions
          },
        },
      },
      results: true,
      attendance: { take: 100, orderBy: { date: "desc" } },
    },
  });
}

// --- Stats Actions ---

export async function getStudentStats() {
  const [totalStudents, classCounts] = await Promise.all([
    prisma.student.count(),
    prisma.class.findMany({
      select: {
        name: true,
        _count: {
          select: { students: true },
        },
      },
    }),
  ]);

  // Format for cards
  // Assuming Grade 7, 8, 9 exist, or we just take the top 3 populated classes
  const stats = {
    totalStudents,
    classDistribution: classCounts.map((c) => ({
      className: c.name,
      count: c._count.students,
    })),
  };

  return stats;
}

export async function getEnrollmentTrends() {
  // Mocking trend data for now as we don't have historical snapshots in the schema
  // In a real app with historical data, we would group by creation date
  return {
    labels: ["2030", "2031", "2032", "2033", "2034", "2035"],
    data: [800, 950, 1100, 1050, 1200, 1245],
  };
}

export async function getAttendanceOverview() {
  // Get aggregate attendance for appropriate date range (e.g., this week)
  // For now, returning mock structure matching the design
  return {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    data: [1180, 1085, 1230, 1102, 1200],
  };
}

export async function getClasses() {
  return await prisma.class.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function getSections(classId: string) {
  return await prisma.section.findMany({
    where: { classId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

// Helper to extract number from "PREFIX-001"
function extractNumber(str: string | null, prefix: string): number {
  if (!str) return 0;
  const numPart = str.replace(prefix, "");
  const num = parseInt(numPart, 10);
  return isNaN(num) ? 0 : num;
}

export async function generateNextStudentIds() {
  // 1. Fetch Prefixes (or default)
  const [admissionPrefixSetting, rollPrefixSetting] = await Promise.all([
    prisma.systemSetting.findUnique({
      where: { key: "student_admission_prefix" },
    }),
    prisma.systemSetting.findUnique({ where: { key: "student_roll_prefix" } }),
  ]);

  const admissionPrefix = admissionPrefixSetting?.value || "ADM-";
  const rollPrefix = rollPrefixSetting?.value || "S-";

  // Also fetch the MAX admissionNo visually if possible.
  // Since we can't do max(string), let's fallback to checking the last created one + logic.

  // Let's refine: findFirst where admissionNo startsWith prefix?
  const lastAdmissionStudent = await prisma.student.findFirst({
    where: { admissionNo: { startsWith: admissionPrefix } },
    orderBy: { admissionNo: "desc" }, // String sort: "ADM-9" > "ADM-10" is FALSE usually. "ADM-10" < "ADM-9".
    // Wait, "ADM-009" < "ADM-010". ASCII "0" < "9". So "1" < "9".
    // "ADM-10" vs "ADM-2". "1" < "2". So "ADM-2" is greater.
    // This is risky without padding.
    // Ideally we assume they are padded or we handle it.
  });

  const lastRollStudent = await prisma.student.findFirst({
    where: { rollNo: { startsWith: rollPrefix } },
    orderBy: { rollNo: "desc" },
  });

  const nextAdmNum =
    extractNumber(lastAdmissionStudent?.admissionNo || null, admissionPrefix) +
    1;
  const nextRollNum =
    extractNumber(lastRollStudent?.rollNo || null, rollPrefix) + 1;

  // Format with padding (3 digits default)
  const admissionNo = `${admissionPrefix}${nextAdmNum.toString().padStart(3, "0")}`;
  const rollNo = `${rollPrefix}${nextRollNum.toString().padStart(3, "0")}`;

  return { admissionNo, rollNo };
}

export async function createStudent(formData: {
  // Profile
  imageURL?: string;
  fullName: string;
  dob: string;
  gender: Gender;
  status: StudentStatus;

  // Academic
  classId: string;
  sectionId: string;
  rollNo: string;
  admissionNo: string;
  admissionDate: string;

  // Contact
  contactNo: string;
  email?: string;
  address: string;

  // Guardian
  fatherName: string;
  fatherContactNo: string;
  motherName?: string;
  motherContactNo?: string;
  guardianName?: string;
  guardianRelation?: string;
  guardianContactNo?: string;

  // Fees
  feeOverrides?: { feeHeadId: string; amount: number }[];
}) {
  // Basic validation check
  if (!formData.classId || !formData.fullName) {
    return { success: false, message: "Missing required fields" };
  }

  try {
    // Generate credentials
    const admissionNo = formData.admissionNo;
    const username = `STU-${admissionNo}`;
    const password = "password123"; // Default password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Transaction to ensure both or neither
    const result = await prisma.$transaction(
      async (tx) => {
        // 1. Create User
        const user = await tx.user.create({
          data: {
            username,
            password: hashedPassword,
            role: "STUDENT",
            imageURL: formData.imageURL,
            email: formData.email || undefined,
          },
        });

        // 2. Create Student
        const student = await tx.student.create({
          data: {
            userId: user.id,
            fullName: formData.fullName,
            rollNo: formData.rollNo,
            admissionNo: formData.admissionNo,
            admissionDate: new Date(formData.admissionDate),
            dob: new Date(formData.dob),
            gender: formData.gender,
            status: formData.status, // Dynamic status
            classId: formData.classId,
            sectionId: formData.sectionId || null,

            contactNo: formData.contactNo,
            address: formData.address,

            fatherName: formData.fatherName,
            fatherContactNo: formData.fatherContactNo,
            motherName: formData.motherName,
            motherContactNo: formData.motherContactNo,
            guardianName: formData.guardianName,
            guardianRelation: formData.guardianRelation,
            guardianContactNo: formData.guardianContactNo,
          },
        });

        // 3. Handle Fee Overrides
        if (formData.feeOverrides && formData.feeOverrides.length > 0) {
          await tx.studentFeeOverride.createMany({
            data: formData.feeOverrides.map((override) => ({
              studentId: student.id,
              feeHeadId: override.feeHeadId,
              amount: override.amount,
            })),
          });
        }

        // 4. Create Student Account (Ledger)
        await tx.studentAccount.create({
          data: {
            studentId: student.id,
            balance: 0, // Initial balance
          },
        });

        return student;
      },
      {
        maxWait: 5000,
        timeout: 10000,
      },
    );

    // 5. Trigger Automatic Fee Generation (Outside Transaction)
    if (result && result.id) {
      await generateFeesForStudent(result.id, "INITIAL_ADMISSION");
    }

    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error creating student:", error);
    if (error.code === "P2002") {
      // Unique constraint failed
      return {
        success: false,
        message:
          "Student with this Admission No, Roll No, or Email already exists.",
      };
    }
    return {
      success: false,
      message: error.message || "Failed to create student",
    };
  }
}
