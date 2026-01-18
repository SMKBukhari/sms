"use server";

import { prisma } from "@/lib/prisma";

export async function getClassFeeStructure(classId: string) {
  if (!classId) return [];

  try {
    const feeStructures = await prisma.feeStructure.findMany({
      where: { classId },
      include: {
        feeHead: true,
      },
    });

    return feeStructures.map((fs) => ({
      id: fs.id,
      feeHeadId: fs.feeHeadId,
      name: fs.feeHead.name,
      amount: fs.amount,
    }));
  } catch (error) {
    console.error("Error fetching fee structure:", error);
    return [];
  }
}
