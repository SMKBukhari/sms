"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// --- FEE HEADS ---

export async function getFeeHeads() {
  try {
    return await prisma.feeHead.findMany({
      orderBy: { name: "asc" },
    });
  } catch (error) {
    return [];
  }
}

export async function createFeeHead(name: string, description?: string) {
  try {
    await prisma.feeHead.create({ data: { name, description } });
    revalidatePath("/settings/finance/fees");
    return { success: true, message: "Fee Head created" };
  } catch (error) {
    return { success: false, message: "Failed to create Fee Head" };
  }
}

export async function deleteFeeHead(id: string) {
  try {
    await prisma.feeHead.delete({ where: { id } });
    revalidatePath("/settings/finance/fees");
    return { success: true, message: "Fee Head deleted" };
  } catch (error) {
    return { success: false, message: "Failed to delete Fee Head" };
  }
}

// --- FEE STRUCTURES ---

export async function getFeeStructures() {
  try {
    return await prisma.feeStructure.findMany({
      include: {
        class: true,
        feeHead: true,
      },
      orderBy: { class: { name: "asc" } },
    });
  } catch (error) {
    return [];
  }
}

export async function createFeeStructure(data: {
  classId: string;
  feeHeadId: string;
  amount: number;
  dueDate?: string;
}) {
  try {
    await prisma.feeStructure.create({
      data: {
        classId: data.classId,
        feeHeadId: data.feeHeadId,
        amount: data.amount,
        dueDate: data.dueDate,
      },
    });
    revalidatePath("/settings/finance/fees");
    return { success: true, message: "Fee Structure created" };
  } catch (error) {
    return { success: false, message: "Failed to create Fee Structure" };
  }
}

export async function deleteFeeStructure(id: string) {
  try {
    await prisma.feeStructure.delete({ where: { id } });
    revalidatePath("/settings/finance/fees");
    return { success: true, message: "Fee Structure deleted" };
  } catch (error) {
    return { success: false, message: "Failed to delete Fee Structure" };
  }
}
