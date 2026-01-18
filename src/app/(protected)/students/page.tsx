import {
  getAttendanceOverview,
  getEnrollmentTrends,
  getStudents,
  getStudentStats,
} from "@/actions/student";
import { AttendanceOverview } from "@/components/students/attendance-overview";
import { EnrollmentTrends } from "@/components/students/enrollment-trend";
import { SpecialPrograms } from "@/components/students/special-programs";
import { StudentStats } from "@/components/students/student-stats";
import { StudentListClient } from "./_components/StudentListClient";
import { AcademicPerformance } from "@/components/students/academic-performance";
import { StudentStatus } from "@/generated/prisma/client";

export default async function StudentsPage(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const searchParams = await props.searchParams;

  const page = Number(searchParams.page) || 1;
  const search = searchParams.search as string;
  const status = searchParams.status as StudentStatus;

  // Fetch all data in parallel
  const [stats, trendData, attendanceData, studentsData] = await Promise.all([
    getStudentStats(),
    getEnrollmentTrends(),
    getAttendanceOverview(),
    getStudents({ page, search, status }),
  ]);

  return (
    <div className='flex flex-col gap-6'>
      {/* Header Section */}
      {/* <div className='flex flex-col gap-1'>
        <h1 className='text-2xl font-bold tracking-tight'>Students</h1>
        <p className='text-muted-foreground text-sm'>Dashboard / Students</p>
      </div> */}

      {/* Main Content Area */}
      <div className='w-full'>
        <StudentListClient
          initialStudents={studentsData.students}
          totalStudents={studentsData.total}
          currentPage={page}
          totalPages={studentsData.totalPages}
        />
      </div>
    </div>
  );
}
