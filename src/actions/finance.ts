"use server";

import { prisma } from "@/lib/prisma";
import { TransactionType } from "@/generated/prisma/enums";
import { revalidatePath } from "next/cache";

export async function collectFee(formData: FormData) {
  const studentId = formData.get("studentId") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const description = formData.get("description") as string;

  if (!studentId || !amount) {
    throw new Error("Missing required fields");
  }

  await prisma.$transaction(async (tx) => {
    // 1. Create Transaction (CREDIT means paying off debt)
    await tx.transaction.create({
      data: {
        account: { connect: { studentId } },
        amount,
        type: TransactionType.CREDIT,
        description: description || "Fee Payment",
      },
    });

    // 2. Update Student Account Balance
    const account = await tx.studentAccount.findUnique({
      where: { studentId },
    });
    if (account) {
      await tx.studentAccount.update({
        where: { studentId },
        data: { balance: account.balance - amount }, // Decrease balance
      });
    }
  });

  revalidatePath("/finance");
  revalidatePath("/students");
}

export async function getTransactions(searchParams: {
  studentId?: string;
  page?: number;
}) {
  const where = searchParams.studentId
    ? { studentId: searchParams.studentId }
    : {};

  // Actually relation is Transaction -> Account -> Student
  // Transaction has accountId. Account has studentId.

  const whereClause = searchParams.studentId
    ? {
        account: {
          studentId: searchParams.studentId,
        },
      }
    : {};

  return await prisma.transaction.findMany({
    where: whereClause,
    include: {
      account: {
        include: { student: true },
      },
    },
    orderBy: { date: "desc" },
    take: 50,
  });
}
