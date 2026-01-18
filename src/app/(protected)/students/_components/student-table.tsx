"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { StudentWithDetails } from "./types";
import { DynamicTable } from "@/components/ui/dynamic-table/DynamicTable";
import { TableColumn, TableAction } from "@/components/ui/dynamic-table/types";
import { Edit, Eye, Trash, UserX } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { getAvatarUrl } from "./student-grid"; // Reuse helper
import { cn } from "@/lib/utils";

interface StudentTableProps {
  students: StudentWithDetails[];
  totalStudents?: number;
  currentPage?: number;
  totalPages?: number;
}

enum StudentStatus {
  ACTIVE = "ACTIVE",
  ON_LEAVE = "ON_LEAVE",
  INACTIVE = "INACTIVE",
}

export function StudentTable({
  students,
  totalStudents,
  currentPage,
  totalPages,
}: StudentTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  console.log(students);

  // Columns Configuration
  const columns: TableColumn<StudentWithDetails>[] = [
    {
      id: "identity",
      label: "Student",
      width: "300px",
      sticky: "left",
      render: (student) => {
        const statusColor =
          student.status === StudentStatus.ACTIVE
            ? "bg-primary-green/20 text-primary-green border-primary-green"
            : student.status === StudentStatus.ON_LEAVE
              ? "bg-primary-warning/20 text-primary-warning border-primary-warning"
              : "bg-primary-danger/20 text-primary-danger border-primary-danger";

        return (
          <div className='flex items-center gap-3'>
            <Avatar className='h-10 w-10 border bg-primary-bg'>
              <AvatarImage src={getAvatarUrl(student) || ""} />
              <AvatarFallback className='font-medium bg-primary-bg'>
                {student.fullName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className='flex flex-col gap-0.5'>
              <span className='text-sm'>{student.fullName}</span>
              <div className='flex items-center gap-2.5 text-xs text-muted-foreground'>
                <span className='text-xs bg-primary/20 px-2 py-0.5 rounded text-primary font-semibold'>
                  {student.admissionNo}
                </span>
                <span className='w-1 h-1 rounded-full bg-primary-border' />
                <span className='text-xs bg-primary-warning/20 px-2 py-0.5 rounded text-primary-warning font-semibold'>
                  {student.rollNo}
                </span>
                <Badge className={`${statusColor} font-semibold`}>
                  {student.status.replace("_", " ")}
                </Badge>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: "class",
      label: "Class",
      sortable: true,
      render: (student) => (
        <div
          className={`text-xs px-2 py-1.5 rounded font-semibold flex justify-center items-center gap-2 bg-${student.section?.color}/20 text-${student.section?.color}`}
        >
          <span className='text-xs'>
            {student.class.name}
            <span className={`ml-1 text-xs`}>• {student.section?.name}</span>
          </span>
        </div>
      ),
    },
    {
      id: "personal",
      label: "Personal Info",
      hideOnMobile: true,
      render: (student) => {
        const genderStyles =
          student.gender === "MALE"
            ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
            : "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30";

        return (
          <div className='flex flex-col gap-1.5'>
            {/* Futuristic DOB Display */}
            <div className='flex items-baseline gap-1 font-mono'>
              <span className='font-semibold text-foreground'>
                {format(new Date(student.dob), "dd MMM yyyy")}
              </span>
            </div>

            <div className='flex items-center gap-2'>
              {/* Gender Badge with refined shape */}
              <Badge className={cn("font-semibold uppercase", genderStyles)}>
                {student.gender}
                <span className='mx-1 text-xs'>•</span>
                {/* Age Indicator */}
                <span className='font-semibold'>
                  {new Date().getFullYear() -
                    new Date(student.dob).getFullYear()}
                  y
                </span>
              </Badge>
            </div>
          </div>
        );
      },
    },
    {
      id: "contact",
      label: "Contact",
      hideOnMobile: true,
      render: (student) => (
        <div className='flex flex-col text-sm'>
          <span className='truncate'>{student.contactNo || "N/A"}</span>
          <span
            className='text-xs text-muted-foreground truncate'
            title={student.address || ""}
          >
            {student.address || "-"}
          </span>
        </div>
      ),
    },
    {
      id: "family",
      label: "Family",
      hideOnMobile: true,
      render: (student) => (
        <div className='flex flex-col text-sm'>
          <span className='font-medium text-xs'>
            Father: {student.fatherName || "N/A"}
          </span>
          <span className='text-xs text-muted-foreground'>
            {student.fatherContactNo}
          </span>
        </div>
      ),
    },
  ];

  // Actions Configuration
  const actions: TableAction<StudentWithDetails>[] = [
    {
      id: "view",
      label: "View Details",
      icon: <Eye className='h-4 w-4' />,
      onClick: (student) => router.push(`/students/${student.id}`),
    },
    {
      id: "edit",
      label: "Edit Student",
      icon: <Edit className='h-4 w-4' />,
      onClick: (student) => toast.info(`Editing ${student.fullName}`),
    },
    {
      id: "archive",
      label: "Archive",
      variant: "destructive",
      icon: <UserX className='h-4 w-4' />,
      onClick: (student) => toast.error(`Archived ${student.fullName}`),
    },
  ];

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    router.replace(`/students?${params.toString()}`);
  };

  return (
    <DynamicTable
      data={students}
      columns={columns}
      actions={actions}
      keyField='id'
      selectable
      onSelectionChange={(rows) => console.log("Selected:", rows)}
      totalItems={totalStudents}
      currentPage={currentPage}
      pageSize={10} // Hardcoded for now, should match backend
      onPageChange={handlePageChange}
      emptyState={
        <div className='flex flex-col items-center justify-center p-8'>
          <p className='text-muted-foreground'>No students found.</p>
        </div>
      }
    />
  );
}
