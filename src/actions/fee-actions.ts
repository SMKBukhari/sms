"use server";

import { prisma } from "@/lib/prisma";
import {
  FeeFrequency,
  PaymentStatus,
  TransactionType,
} from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";

/**
 * Generates fees for a student based on their class fee structure and overrides.
 * Handles both ONE_TIME (creation) and MONTHLY fees.
 */
export async function generateFeesForStudent(
  studentId: string,
  type: "INITIAL_ADMISSION" | "MONTHLY_GENERATE",
  month?: number,
  year?: number,
) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      class: {
        include: {
          feeStructures: {
            include: { feeHead: true },
          },
        },
      },
      feeOverrides: true,
      account: true,
    },
  });

  if (!student) throw new Error("Student not found");
  if (!student.account) throw new Error("Student account not found");

  const now = new Date();
  const targetMonth = month ?? now.getMonth();
  const targetYear = year ?? now.getFullYear();

  // 1. Filter applicable fee structures
  const applicableFees = student.class.feeStructures.filter((fs) => {
    if (type === "INITIAL_ADMISSION") {
      // Generate ONE_TIME fees + MONTHLY fees for the starting month
      return (
        fs.feeHead.frequency === "ONE_TIME" ||
        fs.feeHead.frequency === "MONTHLY"
      );
    } else {
      // Monthly generation only checks MONTHLY fees
      return fs.feeHead.frequency === "MONTHLY";
    }
  });

  const generatedFees = [];
  let totalAddedAmount = 0;

  for (const structure of applicableFees) {
    // Check if duplicate exists (idempotency)
    // For ONE_TIME: Check if ANY record exists for this feeHead for this student
    // For MONTHLY: Check if record exists for this feeHead + Month + Year

    let existingFee = null;

    if (structure.feeHead.frequency === "ONE_TIME") {
      existingFee = await prisma.studentFee.findFirst({
        where: {
          studentId: student.id,
          feeHeadId: structure.feeHeadId,
        },
      });
    } else {
      existingFee = await prisma.studentFee.findFirst({
        where: {
          studentId: student.id,
          feeHeadId: structure.feeHeadId,
          month: targetMonth,
          year: targetYear,
        },
      });
    }

    if (existingFee) continue; // Skip if already generated

    // Determine Amount (Structure vs Override)
    const override = student.feeOverrides.find(
      (o) => o.feeHeadId === structure.feeHeadId,
    );
    const amount = override ? override.amount : structure.amount;

    // Create Fee Record
    // Set dueDate. If structure has specific date (e.g. "5"), try to construct valid date
    let dueDate = new Date(targetYear, targetMonth + 1, 0); // Default to end of month
    if (structure.dueDate) {
      const day = parseInt(structure.dueDate);
      if (!isNaN(day)) {
        dueDate = new Date(targetYear, targetMonth, day);
      }
    }

    const newFee = await prisma.studentFee.create({
      data: {
        studentId: student.id,
        feeHeadId: structure.feeHeadId,
        amount,
        paidAmount: 0,
        status: "PENDING",
        dueDate,
        month: targetMonth,
        year: targetYear,
      },
    });

    generatedFees.push(newFee);
    totalAddedAmount += amount;
  }

  if (totalAddedAmount > 0) {
    // Update Ledger (Debit) - Increase Balance (Due)
    await prisma.studentAccount.update({
      where: { id: student.account.id },
      data: {
        balance: { increment: totalAddedAmount },
        transactions: {
          create: {
            amount: totalAddedAmount,
            type: "DEBIT",
            description: `Fee Generation for ${type === "INITIAL_ADMISSION" ? "Admission" : targetMonth + 1 + "/" + targetYear}`,
          },
        },
      },
    });
  }

  return { success: true, feesGenerated: generatedFees.length };
}

/**
 * Processes a payment for a specific fee record.
 * Supports partial payments.
 */
export async function payFee(
  studentFeeId: string,
  amount: number,
  paymentMethod: string = "CASH", // Placeholder for now
) {
  const fee = await prisma.studentFee.findUnique({
    where: { id: studentFeeId },
    include: { student: { include: { account: true } } },
  });

  if (!fee) return { success: false, message: "Fee record not found" };
  if (!fee.student.account)
    return { success: false, message: "Account not found" };

  const remainingDue = fee.amount - fee.paidAmount;
  if (amount > remainingDue) {
    return { success: false, message: "Amount exceeds remaining due" };
  }

  // Calculate new status
  const newPaidAmount = fee.paidAmount + amount;
  let newStatus: PaymentStatus = "PARTIALLY_PAID";
  if (newPaidAmount >= fee.amount) {
    // Using >= for float safety, though checks prevented >
    newStatus = "PAID";
  }

  // Transaction
  await prisma.$transaction(async (tx) => {
    // 1. Update Fee Record
    await tx.studentFee.update({
      where: { id: studentFeeId },
      data: {
        paidAmount: newPaidAmount,
        status: newStatus,
      },
    });

    // 2. Update Account (Credit) - Decrease Balance
    await tx.studentAccount.update({
      where: { id: fee.student.account!.id },
      data: {
        balance: { decrement: amount },
      },
    });

    // 3. Record Transaction
    await tx.transaction.create({
      data: {
        accountId: fee.student.account!.id,
        amount: amount,
        type: "CREDIT",
        description: `Payment for Fee`, // could fetch Head Name
        studentFeeId: fee.id,
      },
    });
  });

  revalidatePath("/finance/fees-collection");
  return { success: true };
}

export async function getStudentFees(studentId: string) {
  return await prisma.studentFee.findMany({
    where: { studentId },
    include: { feeHead: true },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });
}
