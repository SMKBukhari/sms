import { Card, CardContent } from "@/components/ui/card";
import { Users, User, GraduationCap, School } from "lucide-react";

interface StudentStatsProps {
  stats: {
    totalStudents: number;
    classDistribution: { className: string; count: number }[];
  };
}

export function StudentStats({ stats }: StudentStatsProps) {
  // Helper to find specific grade counts or just map them
  const grade7 =
    stats.classDistribution.find((c) => c.className.toLowerCase().includes("7"))
      ?.count || 0;
  const grade8 =
    stats.classDistribution.find((c) => c.className.toLowerCase().includes("8"))
      ?.count || 0;
  const grade9 =
    stats.classDistribution.find((c) => c.className.toLowerCase().includes("9"))
      ?.count || 0;

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
      <Card className='bg-sky-100 dark:bg-sky-900/20 border-none shadow-sm'>
        <CardContent className='p-6 flex flex-col justify-between h-full'>
          <div className='flex items-center justify-between'>
            <div className='space-y-1'>
              <p className='text-3xl font-bold text-sky-700 dark:text-sky-300'>
                {stats.totalStudents}
              </p>
              <p className='text-sm font-medium text-sky-600/80 dark:text-sky-400/80'>
                Total Students
              </p>
            </div>
            <div className='bg-sky-200/50 p-2 rounded-full dark:bg-sky-800/50'>
              <Users className='h-5 w-5 text-sky-600 dark:text-sky-300' />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className='bg-white dark:bg-card border shadow-sm'>
        <CardContent className='p-6 flex flex-col justify-between h-full'>
          <div className='flex items-center justify-between space-y-0 pb-2'>
            <span className='text-2xl font-bold text-gray-800 dark:text-gray-100'>
              {grade7}
            </span>
            <div className='bg-cyan-100 p-2 rounded-full dark:bg-cyan-900/30'>
              <User className='h-4 w-4 text-cyan-600 dark:text-cyan-400' />
            </div>
          </div>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Grade 7 Students
          </p>
        </CardContent>
      </Card>

      <Card className='bg-white dark:bg-card border shadow-sm'>
        <CardContent className='p-6 flex flex-col justify-between h-full'>
          <div className='flex items-center justify-between space-y-0 pb-2'>
            <span className='text-2xl font-bold text-gray-800 dark:text-gray-100'>
              {grade8}
            </span>
            <div className='bg-indigo-100 p-2 rounded-full dark:bg-indigo-900/30'>
              <User className='h-4 w-4 text-indigo-600 dark:text-indigo-400' />
            </div>
          </div>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Grade 8 Students
          </p>
        </CardContent>
      </Card>

      <Card className='bg-white dark:bg-card border shadow-sm'>
        <CardContent className='p-6 flex flex-col justify-between h-full'>
          <div className='flex items-center justify-between space-y-0 pb-2'>
            <span className='text-2xl font-bold text-gray-800 dark:text-gray-100'>
              {grade9}
            </span>
            <div className='bg-pink-100 p-2 rounded-full dark:bg-pink-900/30'>
              <User className='h-4 w-4 text-pink-600 dark:text-pink-400' />
            </div>
          </div>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Grade 9 Students
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
