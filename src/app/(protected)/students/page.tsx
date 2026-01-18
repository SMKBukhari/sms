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
import { StudentTable } from "@/components/students/student-table";
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
      <div className='flex flex-col gap-1'>
        <h1 className='text-2xl font-bold tracking-tight'>Students</h1>
        <p className='text-muted-foreground text-sm'>Dashboard / Students</p>
      </div>

      {/* Top Stats & Charts Row */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Academic Performance - Takes 5 columns */}
        <div className='h-[300px] md:h-auto'>
          <AcademicPerformance />
        </div>

        {/* Enrollment Trends - Takes 4 columns */}
        <div className='h-[300px] md:h-auto'>
          <EnrollmentTrends data={trendData} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        {/* Student Table - Main Left Column */}
        <div className='lg:col-span-8'>
          <StudentTable
            initialStudents={studentsData.students}
            totalStudents={studentsData.total}
            currentPage={page}
            totalPages={studentsData.totalPages}
          />
        </div>

        {/* Right Sidebar - Attendance & Programs */}
        <div className='lg:col-span-4 space-y-6'>
          <AttendanceOverview data={attendanceData} />
        </div>
      </div>
    </div>
  );
}
