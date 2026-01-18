import {
  Student as PrismaStudent,
  Class,
  Section,
} from "@/generated/prisma/client";

export interface StudentWithDetails extends PrismaStudent {
  class: Class;
  section: Section | null;
  user: { imageURL: string | null };
  gpa: string;
  performance: string;
  attendanceRate: number;
}
