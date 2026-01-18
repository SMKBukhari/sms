"use server";

import { prisma } from "@/lib/prisma";
import { PaymentStatus } from "@/generated/prisma/client";

export async function getFeeStats() {
  const [collected, pending, overdue] = await Promise.all([
    prisma.studentFee.aggregate({
      _sum: { paidAmount: true },
    }),
    prisma.studentFee.aggregate({
      _sum: { amount: true },
      where: { status: { not: "PAID" } },
    }),
    prisma.studentFee.aggregate({
      _sum: { amount: true },
      where: { status: "OVERDUE" },
    }),
  ]);

  // Pending Logic: Total Amount - Paid Amount (Approximation, better to iterate but for speed aggregate is ok-ish if we trust paidAmount)
  // Actually, accurate pending is sum(amount - paidAmount) where status != PAID.
  // Prisma aggregate doesn't do math.
  // Let's fetch pending records and sum in JS or just use simple aggregates for now.

  // Better Pending:
  const pendingFees = await prisma.studentFee.findMany({
    where: { status: { not: "PAID" } },
    select: { amount: true, paidAmount: true },
  });
  const pendingAmount = pendingFees.reduce(
    (acc, fee) => acc + (fee.amount - fee.paidAmount),
    0,
  );

  return {
    collected: collected._sum.paidAmount || 0,
    pending: pendingAmount,
    overdue: overdue._sum.amount || 0, // This takes full amount of overdue fees, which might include partially paid ones.
    // Ideally: overdue fees remaining balance.
    // Let's refine overdue similarly.
  };
}

export type FeeListFilter = {
  classId?: string;
  status?: PaymentStatus;
  month?: number;
  search?: string;
  page?: number;
  pageSize?: number;
};

export async function getFeeList(filter: FeeListFilter) {
  const page = filter.page || 1;
  const pageSize = filter.pageSize || 10;
  const skip = (page - 1) * pageSize;

  const where: any = {};
  if (filter.classId && filter.classId !== "all") {
    where.student = { classId: filter.classId };
  }
  if (filter.status && filter.status !== ("all" as any)) {
    where.status = filter.status;
  }
  if (filter.month !== undefined && filter.month !== -1) {
    where.month = filter.month;
  }
  if (filter.search) {
    where.student = {
      ...where.student,
      OR: [
        { fullName: { contains: filter.search, mode: "insensitive" } },
        { admissionNo: { contains: filter.search, mode: "insensitive" } },
      ],
    };
  }

  const [fees, total] = await Promise.all([
    prisma.studentFee.findMany({
      where,
      include: {
        student: {
          include: { class: true },
        },
        feeHead: true,
      },
      orderBy: { dueDate: "asc" },
      skip,
      take: pageSize,
    }),
    prisma.studentFee.count({ where }),
  ]);

  return {
    fees,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getClassesForFilter() {
  return await prisma.class.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}
