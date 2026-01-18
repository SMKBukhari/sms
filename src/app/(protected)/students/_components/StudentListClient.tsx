"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import {
  LayoutGrid,
  Table as TableIcon,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentGrid } from "./student-grid";
import { StudentTable } from "./student-table";
import { StudentWithDetails } from "./types";
import NewStudentDialog from "@/components/students/new-student-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import Link from "next/link";

interface StudentListClientProps {
  initialStudents: StudentWithDetails[];
  totalStudents: number;
  currentPage: number;
  totalPages: number;
}

export function StudentListClient({
  initialStudents,
  totalStudents,
  currentPage,
  totalPages,
}: StudentListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();
  const [view, setView] = useState<"grid" | "table">("grid");

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
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
    <div className='flex flex-col gap-6'>
      {/* Controls Header */}
      <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
        <div className='flex flex-col gap-1'>
          <h2 className='md:text-2xl text-lg font-bold tracking-tight'>
            All Students
          </h2>
          <p className='text-sm text-muted-foreground'>
            {totalStudents} total records
          </p>
        </div>

        <div className='flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto'>
          {!isMobile && (
            <div className='flex items-center p-1 rounded-lg border border-primary-border gap-2 h-11'>
              <Button
                variant={view === "grid" ? "default" : "ghost"}
                size='icon'
                className={`h-8 w-8 ${view === "grid" ? "bg-primary shadow-sm text-primary-foreground" : "dark:text-primary-foreground text-muted-foreground"}`}
                onClick={() => setView("grid")}
              >
                <LayoutGrid className='h-4 w-4' />
              </Button>
              <Button
                variant={view === "table" ? "default" : "ghost"}
                size='icon'
                className={`h-8 w-8 ${view === "table" ? "bg-primary shadow-sm text-primary-foreground" : "dark:text-primary-foreground text-muted-foreground"}`}
                onClick={() => setView("table")}
              >
                <TableIcon className='h-4 w-4' />
              </Button>
            </div>
          )}
          {/* Search */}
          <div className='relative w-full sm:w-64'>
            <Search className='absolute left-2.5 top-3.5 h-4 w-4 text-muted-foreground' />
            <Input
              placeholder='Search students...'
              className='pl-8 input'
              onChange={(e) => handleSearch(e.target.value)}
              defaultValue={searchParams.get("search")?.toString()}
            />
          </div>

          {/* Filter */}
          <Select
            onValueChange={handleFilter}
            defaultValue={searchParams.get("status") || "ALL"}
          >
            <SelectTrigger
              className={`select ${isMobile ? "w-full" : "w-auto"}`}
            >
              <div className='flex items-center gap-2'>
                <Filter className='h-3.5 w-3.5 text-muted-foreground' />
                <SelectValue placeholder='Status' />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='ALL'>All Status</SelectItem>
              <SelectItem value='ACTIVE'>Active</SelectItem>
              <SelectItem value='ON_LEAVE'>On Leave</SelectItem>
              <SelectItem value='DROPPED'>Dropped</SelectItem>
            </SelectContent>
          </Select>

          <div className='hidden sm:block w-px h-8 bg-border mx-1' />

          {/* Add Button */}
          <NewStudentDialog />
          {/* <Link href='/students/create'>
            <Button className={`${isMobile ? "w-full" : ""}`}>
              <Plus className='mr-2 h-4 w-4' /> Add Student
            </Button>
          </Link> */}
        </div>
      </div>

      {/* Content View */}
      <div className='min-h-[400px]'>
        {view === "grid" ? (
          <StudentGrid students={initialStudents} />
        ) : (
          <StudentTable students={initialStudents} />
        )}
      </div>

      {/* Pagination Footer */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between border-t border-border pt-4 px-1'>
          <p className='text-sm text-muted-foreground'>
            Page {currentPage} of {totalPages}
          </p>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className='h-8 gap-1'
            >
              <ChevronLeft className='h-4 w-4' /> Previous
            </Button>
            <Button
              variant='outline'
              size='sm'
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className='h-8 gap-1'
            >
              Next <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
