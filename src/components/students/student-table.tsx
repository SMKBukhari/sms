"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  UserIcon,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import Link from "next/link";
import { StudentStatus } from "@/generated/prisma/client";
import EmptyState from "../global/EmptyState";
import NewStudentDialog from "./new-student-dialog";

interface Student {
  id: string;
  fullName: string;
  rollNo: string;
  class: { name: string };
  gpa: string; // Calculated field
  performance: string; // Calculated field
  attendanceRate: number; // Calculated field
  status: StudentStatus;
  imageURL?: string | null;
}

interface StudentTableProps {
  initialStudents: Student[];
  totalStudents: number;
  currentPage: number;
  totalPages: number;
}

export function StudentTable({
  initialStudents,
  totalStudents,
  currentPage,
  totalPages,
}: StudentTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    params.set("page", "1"); // Reset directly to page 1
    router.replace(`/students?${params.toString()}`);
  }, 300);

  const handleFilter = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status && status !== "ALL") {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    params.set("page", "1");
    router.replace(`/students?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.replace(`/students?${params.toString()}`);
  };

  return (
    <div className='flex flex-col gap-4 bg-card rounded-xl border border-primary-border shadow-sm p-4'>
      <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
        <h3 className='text-lg font-bold'>Students</h3>
        <div className='flex items-center gap-2 w-full md:w-auto'>
          <div className='relative flex-1 md:w-64'>
            <Search className='absolute left-2.5 top-3.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search for a student'
              className='pl-8 input'
              onChange={(e) => handleSearch(e.target.value)}
              defaultValue={searchParams.get("search")?.toString()}
            />
          </div>
          <Select
            onValueChange={handleFilter}
            defaultValue={searchParams.get("status") || "ALL"}
          >
            <SelectTrigger className='w-[130px] bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800'>
              <SelectValue placeholder='All Status' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='ALL'>All Status</SelectItem>
              <SelectItem value='ACTIVE'>Active</SelectItem>
              <SelectItem value='ON_LEAVE'>On Leave</SelectItem>
              <SelectItem value='DROPPED'>Dropped</SelectItem>
            </SelectContent>
          </Select>

          <NewStudentDialog />
        </div>
      </div>

      <div className='rounded-md border-none'>
        {initialStudents.length === 0 ? (
          <EmptyState
            title='No students found'
            description='Add a new student to get started.'
            content={<NewStudentDialog />}
            icon={<UserIcon />}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className='border-b border-gray-100 dark:border-gray-800 hover:bg-transparent'>
                <TableHead className='w-[250px] text-xs font-semibold uppercase text-gray-400'>
                  Student <ArrowUpDown className='ml-1 h-3 w-3 inline' />
                </TableHead>
                <TableHead className='text-xs font-semibold uppercase text-gray-400'>
                  Class <ArrowUpDown className='ml-1 h-3 w-3 inline' />
                </TableHead>
                <TableHead className='text-xs font-semibold uppercase text-gray-400'>
                  GPA <ArrowUpDown className='ml-1 h-3 w-3 inline' />
                </TableHead>
                <TableHead className='text-xs font-semibold uppercase text-gray-400'>
                  Performance <ArrowUpDown className='ml-1 h-3 w-3 inline' />
                </TableHead>
                <TableHead className='text-xs font-semibold uppercase text-gray-400'>
                  Attendance <ArrowUpDown className='ml-1 h-3 w-3 inline' />
                </TableHead>
                <TableHead className='text-xs font-semibold uppercase text-gray-400'>
                  Status <ArrowUpDown className='ml-1 h-3 w-3 inline' />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialStudents.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className='text-center h-24 text-muted-foreground'
                  >
                    No students found.
                  </TableCell>
                </TableRow>
              ) : (
                initialStudents.map((student) => {
                  const statusColor =
                    student.status === "ACTIVE"
                      ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                      : student.status === "ON_LEAVE"
                        ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                        : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400";

                  const perfColor =
                    student.performance === "Excellent"
                      ? "text-blue-500 fill-blue-500"
                      : student.performance === "Good"
                        ? "text-emerald-500 fill-emerald-500"
                        : student.performance === "Average"
                          ? "text-amber-500 fill-amber-500"
                          : "text-red-500 fill-red-500";

                  return (
                    <TableRow
                      key={student.id}
                      className='border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-900/50 transition-colors'
                    >
                      <TableCell>
                        <div className='flex items-center gap-3'>
                          <Avatar className='h-9 w-9 bg-pink-100/50'>
                            <AvatarImage src={student.imageURL || ""} />
                            <AvatarFallback className='bg-pink-100 text-pink-500 dark:bg-pink-900/30 font-medium'>
                              {student.fullName.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className='font-semibold text-sm text-gray-800 dark:text-gray-200'>
                              {student.fullName}
                            </p>
                            <p className='text-xs text-gray-400'>
                              S-{student.rollNo}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className='font-medium text-gray-600 dark:text-gray-300'>
                        {student.class.name}
                      </TableCell>
                      <TableCell className='font-bold text-sky-500'>
                        {student.gpa}
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2 text-sm'>
                          <div
                            className={`h-2 w-2 rounded-full ${perfColor.replace("fill-", "bg-").split(" ")[0].replace("text-", "bg-")}`}
                          ></div>
                          <span className='font-medium'>
                            {student.performance}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <div className='w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden dark:bg-gray-800'>
                            <div
                              className='h-full bg-pink-400 rounded-full'
                              style={{ width: `${student.attendanceRate}%` }}
                            ></div>
                          </div>
                          <span className='text-xs font-semibold'>
                            {student.attendanceRate}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${statusColor} hover:${statusColor} border-none font-medium px-3 py-1 rounded-full shadow-none`}
                        >
                          {student.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <div className='flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4'>
        <p className='text-xs text-muted-foreground'>
          Showing <span className='font-medium'>{initialStudents.length}</span>{" "}
          of <span className='font-medium'>{totalStudents}</span> results
        </p>
        <div className='flex items-center gap-1'>
          <Button
            variant='outline'
            size='icon'
            className='h-8 w-8'
            disabled={currentPage <= 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <ChevronLeft className='h-4 w-4' />
          </Button>
          {/* Simple pagination for now - can be expanded */}
          <Button
            variant={currentPage === 1 ? "default" : "outline"}
            size='icon'
            className={`h-8 w-8 ${currentPage === 1 ? "bg-pink-100 text-pink-600 hover:bg-pink-200 hover:text-pink-700 dark:bg-pink-900/30 dark:text-pink-400 border-none" : ""}`}
            onClick={() => handlePageChange(1)}
          >
            1
          </Button>
          {totalPages > 1 && (
            <Button
              variant={currentPage === 2 ? "default" : "outline"}
              size='icon'
              className={`h-8 w-8 ${currentPage === 2 ? "bg-pink-100 text-pink-600 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-400 border-none" : ""}`}
              onClick={() => handlePageChange(2)}
            >
              2
            </Button>
          )}
          {totalPages > 3 && (
            <span className='text-xs text-muted-foreground px-2'>...</span>
          )}
          <Button
            variant='outline'
            size='icon'
            className='h-8 w-8'
            disabled={currentPage >= totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </div>
  );
}
