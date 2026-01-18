import { getTransactions } from "@/actions/finance";
import { getStudents } from "@/actions/student";
import { requireRole } from "@/lib/auth";
import { Role } from "@/generated/prisma/enums";
import { CollectFeeDialog } from "./_components/CollectFeeDialog";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function FinancePage() {
  await requireRole([Role.ADMIN]);

  const transactions = await getTransactions({});
  const { students } = await getStudents({ pageSize: 100 }); // Fetch top 100 for dropdown

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-3xl font-bold tracking-tight'>Finance</h1>
        <CollectFeeDialog students={students} />
      </div>

      <Tabs defaultValue='ledger' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='ledger'>Fee Ledger</TabsTrigger>
          <TabsTrigger value='expenses'>Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value='ledger'>
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className='text-right'>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className='h-24 text-center'>
                          No transactions found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      transactions.map((tx) => (
                        <TableRow key={tx.id}>
                          <TableCell>{format(tx.date, "PP")}</TableCell>
                          <TableCell>
                            <div className='flex flex-col'>
                              <span className='font-medium'>
                                {tx.account.student.fullName}
                              </span>
                              <span className='text-xs text-muted-foreground'>
                                {tx.account.student.admissionNo}
                              </span>
                            </div>
                          </TableCell>
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
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='expenses'>
          <Card>
            <CardContent className='pt-6'>
              <p className='text-muted-foreground'>
                Expense management is coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
