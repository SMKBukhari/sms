import { getTeachers } from "@/actions/teacher";
import { requireRole } from "@/lib/auth";
import { Role } from "@/generated/prisma/enums";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Eye, Plus } from "lucide-react";

export default async function TeachersPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  await requireRole([Role.ADMIN]);

  const { search } = await searchParams;
  const teachers = await getTeachers(search);

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold tracking-tight'>Teachers</h1>
        <Button asChild>
          <Link href='/teachers/create'>
            <Plus className='mr-2 h-4 w-4' />
            Add Teacher
          </Link>
        </Button>
      </div>

      <div className='rounded-md border'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Teacher ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Subjects</TableHead>
              <TableHead>Class Teacher</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className='text-right'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className='h-24 text-center'>
                  No teachers found.
                </TableCell>
              </TableRow>
            ) : (
              teachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell className='font-medium'>
                    {teacher.teacherId}
                  </TableCell>
                  <TableCell>{teacher.fullName}</TableCell>
                  <TableCell>
                    <div className='flex flex-wrap gap-1'>
                      {teacher.subjects.map((sub) => (
                        <Badge key={sub.id} variant='secondary'>
                          {sub.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {teacher.sections.map((sec) => (
                      <div key={sec.id} className='text-sm'>
                        {sec.class.name} - {sec.name}
                      </div>
                    ))}
                  </TableCell>
                  <TableCell>{teacher.contactNo || "-"}</TableCell>
                  <TableCell className='text-right'>
                    <Button asChild variant='ghost' size='icon'>
                      <Link href={`/teachers/${teacher.id}`}>
                        <Eye className='h-4 w-4' />
                        <span className='sr-only'>View</span>
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
