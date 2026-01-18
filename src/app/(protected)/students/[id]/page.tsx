import { getStudentById } from "@/actions/student";
import { requireRole } from "@/lib/auth";
import { Role } from "@/generated/prisma/enums"; // Import from generated
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

export default async function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole([Role.ADMIN, Role.TEACHER]);
  const resolvedParams = await params;
  const student = await getStudentById(resolvedParams.id);

  if (!student) {
    notFound();
  }

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            {student.fullName}
          </h1>
          <p className='text-muted-foreground'>
            {student.rollNo} • {student.class.name} /{" "}
            {student.section?.name || "N/A"}
          </p>
        </div>
      </div>

      <Tabs defaultValue='profile' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='profile'>Profile</TabsTrigger>
          <TabsTrigger value='attendance'>Attendance</TabsTrigger>
          <TabsTrigger value='results'>Results</TabsTrigger>
          <TabsTrigger value='finance'>Finance</TabsTrigger>
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
                  {format(student.dob, "PPP")}
                </p>
              </div>
              <div className='space-y-1'>
                <h4 className='text-sm font-medium leading-none'>Gender</h4>
                <p className='text-sm text-muted-foreground'>
                  {student.gender}
                </p>
              </div>
              <div className='space-y-1'>
                <h4 className='text-sm font-medium leading-none'>
                  Admission No
                </h4>
                <p className='text-sm text-muted-foreground'>
                  {student.admissionNo}
                </p>
              </div>
              <div className='space-y-1'>
                <h4 className='text-sm font-medium leading-none'>
                  Admission Date
                </h4>
                <p className='text-sm text-muted-foreground'>
                  {format(student.admissionDate, "PPP")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Guardian & Contact</CardTitle>
            </CardHeader>
            <CardContent className='grid gap-6 md:grid-cols-2'>
              <div className='space-y-1'>
                <h4 className='text-sm font-medium leading-none'>
                  Father Name
                </h4>
                <p className='text-sm text-muted-foreground'>
                  {student.fatherName || "-"}
                </p>
              </div>
              <div className='space-y-1'>
                <h4 className='text-sm font-medium leading-none'>Contact No</h4>
                <p className='text-sm text-muted-foreground'>
                  {student.fatherContactNo || "-"}
                </p>
              </div>
              <div className='space-y-1'>
                <h4 className='text-sm font-medium leading-none'>
                  Mother Name
                </h4>
                <p className='text-sm text-muted-foreground'>
                  {student.motherName || "-"}
                </p>
              </div>
              <div className='space-y-1'>
                <h4 className='text-sm font-medium leading-none'>Address</h4>
                <p className='text-sm text-muted-foreground'>
                  {student.address || "-"}
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

        <TabsContent value='results'>
          <Card>
            <CardContent className='pt-6'>
              <p>Exam results will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='finance' className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-3'>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm font-medium'>
                  Current Balance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-2xl font-bold'>
                  ${student.account?.balance.toLocaleString() || "0.00"}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {student.account?.transactions &&
              student.account.transactions.length > 0 ? (
                <div className='rounded-md border'>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className='text-right'>Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {student.account.transactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>{format(tx.date, "PP")}</TableCell>
                          <TableCell>{tx.description}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                tx.type === "DEBIT" ? "destructive" : "default"
                              }
                            >
                              {tx.type}
                            </Badge>
                          </TableCell>
                          <TableCell className='text-right'>
                            ${tx.amount.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className='text-sm text-muted-foreground'>
                  No transactions found.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
