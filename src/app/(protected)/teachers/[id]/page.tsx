import { getTeacherById } from "@/actions/teacher";
import { requireRole } from "@/lib/auth";
import { Role } from "@/generated/prisma/enums";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default async function TeacherDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole([Role.ADMIN]);
  const resolvedParams = await params;
  const teacher = await getTeacherById(resolvedParams.id);

  if (!teacher) {
    notFound();
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            {teacher.fullName}
          </h1>
          <p className='text-muted-foreground'>
            {teacher.teacherId} •{" "}
            {teacher.qualification || "No Qualification Listed"}
          </p>
        </div>
      </div>

      <Tabs defaultValue='profile' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='profile'>Profile</TabsTrigger>
          <TabsTrigger value='attendance'>Attendance</TabsTrigger>
          <TabsTrigger value='subjects'>Assigned Subjects</TabsTrigger>
          <TabsTrigger value='classes'>Assigned Classes</TabsTrigger>
        </TabsList>
        <TabsContent value='profile' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className='grid gap-6 md:grid-cols-2'>
              <div className='space-y-1'>
                <h4 className='text-sm font-medium leading-none'>
                  Date of Birth
                </h4>
                <p className='text-sm text-muted-foreground'>
                  {format(teacher.dob, "PPP")}
                </p>
              </div>
              <div className='space-y-1'>
                <h4 className='text-sm font-medium leading-none'>Gender</h4>
                <p className='text-sm text-muted-foreground'>
                  {teacher.gender}
                </p>
              </div>
              <div className='space-y-1'>
                <h4 className='text-sm font-medium leading-none'>Experience</h4>
                <p className='text-sm text-muted-foreground'>
                  {teacher.experience || "-"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Details</CardTitle>
            </CardHeader>
            <CardContent className='grid gap-6 md:grid-cols-2'>
              <div className='space-y-1'>
                <h4 className='text-sm font-medium leading-none'>Contact No</h4>
                <p className='text-sm text-muted-foreground'>
                  {teacher.contactNo || "-"}
                </p>
              </div>
              <div className='space-y-1'>
                <h4 className='text-sm font-medium leading-none'>Address</h4>
                <p className='text-sm text-muted-foreground'>
                  {teacher.address || "-"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='attendance'>
          <Card>
            <CardContent className='pt-6'>
              <p>Attendance records will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='subjects'>
          <Card>
            <CardHeader>
              <CardTitle>Subjects Taught</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex flex-wrap gap-2'>
                {teacher.subjects.length > 0 ? (
                  teacher.subjects.map((subject) => (
                    <Badge
                      key={subject.id}
                      variant='secondary'
                      className='text-md px-3 py-1'
                    >
                      {subject.name}
                    </Badge>
                  ))
                ) : (
                  <p className='text-muted-foreground'>No subjects assigned.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='classes'>
          <Card>
            <CardHeader>
              <CardTitle>Class Teacher Responsibilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex flex-col gap-2'>
                {teacher.sections.length > 0 ? (
                  teacher.sections.map((section) => (
                    <div key={section.id} className='p-4 border rounded-lg'>
                      <h4 className='font-semibold'>
                        {section.class.name} - Section {section.name}
                      </h4>
                      <p className='text-sm text-muted-foreground'>
                        Class Teacher
                      </p>
                    </div>
                  ))
                ) : (
                  <p className='text-muted-foreground'>
                    Not assigned as Class Teacher.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
