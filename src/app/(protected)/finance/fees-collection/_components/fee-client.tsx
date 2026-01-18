"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PayFeeModal } from "./pay-fee-modal";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/formatters";
import { DynamicTable } from "@/components/ui/dynamic-table/DynamicTable";
import { TableColumn, TableAction } from "@/components/ui/dynamic-table/types";

// Types
import { PaymentStatus } from "@/generated/prisma/client";

interface FeeClientProps {
  initialFees: any[];
  classes: { id: string; name: string }[];
  stats: { collected: number; pending: number; overdue: number };
}

export function FeesCollectionClient({
  initialFees,
  classes,
  stats,
}: FeeClientProps) {
  const router = useRouter();
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState<string>("all");

  const getStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-700 hover:bg-green-100";
      case "PARTIALLY_PAID":
        return "bg-blue-100 text-blue-700 hover:bg-blue-100";
      case "PENDING":
        return "bg-pink-100 text-pink-700 hover:bg-pink-100";
      case "OVERDUE":
        return "bg-red-100 text-red-700 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // 1. Column Definitions for DynamicTable
  const columns: TableColumn<any>[] = [
    {
      id: "student",
      label: "Student",
      width: "250px",
      sticky: "left",
      render: (fee) => (
        <div className='flex items-center gap-3'>
          <Badge
            variant='secondary'
            className='bg-blue-50 text-blue-600 rounded-sm px-2 font-normal'
          >
            {fee.student.rollNo}
          </Badge>
          <span className='font-medium'>{fee.student.fullName}</span>
        </div>
      ),
    },
    {
      id: "class",
      label: "Class",
      render: (fee) => fee.student.class.name,
    },
    {
      id: "category",
      label: "Fee Category",
      render: (fee) => fee.feeHead.name,
    },
    {
      id: "amount",
      label: "Total Amount",
      align: "left",
      render: (fee) => (
        <span className='font-semibold'>{formatCurrency(fee.amount)}</span>
      ),
    },
    {
      id: "dueDate",
      label: "Due Date",
      render: (fee) => (
        <span className='text-muted-foreground'>
          {format(new Date(fee.dueDate), "MMM d, yyyy")}
        </span>
      ),
    },
    {
      id: "status",
      label: "Status",
      render: (fee) => (
        <Badge
          className={`rounded-full px-3 font-normal shadow-none ${getStatusColor(
            fee.status,
          )}`}
        >
          {fee.status.replace("_", " ")}
        </Badge>
      ),
    },
  ];

  // 2. Row Actions
  const actions: TableAction<any>[] = [
    {
      id: "pay",
      label: "Process Payment",
      onClick: (fee) => {
        setSelectedFee(fee);
        setIsPayModalOpen(true);
      },
    },
  ];

  // Client-side filtering logic
  const filteredFees = useMemo(() => {
    let res = initialFees;
    if (statusFilter !== "all")
      res = res.filter((f) => f.status === statusFilter);
    if (classFilter !== "all")
      res = res.filter((f) => f.student.classId === classFilter);
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      res = res.filter(
        (f) =>
          f.student.fullName.toLowerCase().includes(lower) ||
          f.student.rollNo.toLowerCase().includes(lower),
      );
    }
    return res;
  }, [initialFees, statusFilter, classFilter, searchTerm]);

  return (
    <div className='space-y-6'>
      {/* Stats Section */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card className='hover:shadow-md transition-shadow duration-300 border-primary-border/60 group'>
          <CardContent className='p-6 flex items-center gap-4'>
            <div className='h-12 w-12 rounded-full bg-blue-900 flex items-center justify-center text-white'>
              <span className='text-xl'>✓</span>
            </div>
            <div>
              <h3 className='text-2xl font-bold'>
                {formatCurrency(stats.collected)}
              </h3>
              <p className='text-sm text-muted-foreground'>Fees Collected</p>
            </div>
          </CardContent>
        </Card>
        <Card className='hover:shadow-md transition-shadow duration-300 border-primary-border/60 group'>
          <CardContent className='p-6 flex items-center gap-4'>
            <div className='h-12 w-12 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600'>
              <div className='h-5 w-5 border-2 border-current border-t-transparent rounded-full' />
            </div>
            <div>
              <h3 className='text-2xl font-bold'>
                {formatCurrency(stats.pending)}
              </h3>
              <p className='text-sm text-muted-foreground'>Pending Fees</p>
            </div>
          </CardContent>
        </Card>
        <Card className='hover:shadow-md transition-shadow duration-300 border-primary-border/60 group'>
          <CardContent className='p-6 flex items-center gap-4'>
            <div className='h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center text-pink-600'>
              <span className='text-xl'>!</span>
            </div>
            <div>
              <h3 className='text-2xl font-bold'>
                {formatCurrency(stats.overdue)}
              </h3>
              <p className='text-sm text-muted-foreground'>Overdue Payments</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with DynamicTable */}
      <div className='rounded-xl p-6 shadow-sm border-primary-border/60 bg-card'>
        <div className='flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4'>
          <h2 className='text-lg font-semibold'>Fees Collection</h2>
          <div className='flex flex-wrap gap-2'>
            <Select value={classFilter} onValueChange={setClassFilter}>
              <SelectTrigger className='w-[150px]'>
                <SelectValue placeholder='All Classes' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Classes</SelectItem>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-[150px]'>
                <SelectValue placeholder='All Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='PAID'>Paid</SelectItem>
                <SelectItem value='PENDING'>Pending</SelectItem>
                <SelectItem value='PARTIALLY_PAID'>Partially Paid</SelectItem>
                <SelectItem value='OVERDUE'>Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 3. Using the DynamicTable Component */}
        <DynamicTable
          data={filteredFees}
          columns={columns}
          actions={actions}
          keyField='id'
          selectable
          onSelectionChange={(selected) => console.log(selected)}
          totalItems={filteredFees.length}
          pageSize={10}
          emptyState={
            <div className='py-10 text-center text-muted-foreground'>
              No fees found for the selected criteria.
            </div>
          }
        />
      </div>

      <PayFeeModal
        open={isPayModalOpen}
        onOpenChange={setIsPayModalOpen}
        fee={selectedFee}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
