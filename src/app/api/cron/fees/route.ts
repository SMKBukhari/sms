import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateFeesForStudent } from "@/actions/fee-actions";

export async function GET(req: Request) {
  // Basic authorization check (e.g. CRON_SECRET)
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get("secret");
  if (secret !== process.env.CRON_SECRET && secret !== "my-secret-key") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const activeStudents = await prisma.student.findMany({
      where: { status: "ACTIVE" },
      select: { id: true },
    });

    console.log(
      `Job: Generating monthly fees for ${activeStudents.length} students...`,
    );

    const results = await Promise.allSettled(
      activeStudents.map((student) =>
        generateFeesForStudent(student.id, "MONTHLY_GENERATE"),
      ),
    );

    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const failedCount = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({
      success: true,
      processed: activeStudents.length,
      generated: successCount,
      failed: failedCount,
    });
  } catch (error) {
    console.error("Cron Job Failed:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
