import { prisma } from "../lib/prisma";
import { createStudent } from "../actions/student";
import { payFee, getStudentFees } from "../actions/fee-actions";
import { Gender, StudentStatus } from "../generated/prisma/client";

async function main() {
  console.log("🚀 Starting Fee System Verification...");

  // 1. Setup Test Data
  console.log("📦 Setting up Test Data (Class, FeeHeads, Structure)...");

  // Create Fee Heads
  const admissionHead = await prisma.feeHead.create({
    data: { name: "Test Admission Fee", frequency: "ONE_TIME" },
  });
  const tuitionHead = await prisma.feeHead.create({
    data: { name: "Test Tuition Fee", frequency: "MONTHLY" },
  });

  // Create Class
  const testClass = await prisma.class.create({
    data: { name: "Test Class " + Date.now() }, // Unique name
  });

  // Create Fee Structure
  await prisma.feeStructure.create({
    data: {
      classId: testClass.id,
      feeHeadId: admissionHead.id,
      amount: 5000,
      dueDate: "1", // 1st of month
    },
  });
  await prisma.feeStructure.create({
    data: {
      classId: testClass.id,
      feeHeadId: tuitionHead.id,
      amount: 2000,
      dueDate: "10", // 10th of month
    },
  });

  // 2. Create Student
  console.log("👤 Creating Student...");
  const uniqueId = Date.now().toString().slice(-4);
  const studentResult = await createStudent({
    fullName: "Test Student " + uniqueId,
    dob: "2010-01-01",
    gender: "MALE",
    status: "ACTIVE",
    classId: testClass.id,
    sectionId: "", // Optional
    rollNo: "R-" + uniqueId,
    admissionNo: "ADM-" + uniqueId,
    admissionDate: new Date().toISOString(),
    contactNo: "1234567890",
    address: "Test Address",
    fatherName: "Test Father",
    fatherContactNo: "0987654321",
  });

  if (!studentResult.success || !studentResult.data) {
    console.error("❌ Failed to create student:", studentResult.message);
    return;
  }
  const studentId = studentResult.data.id;
  console.log("✅ Student Created:", studentId);

  // 3. Verify Fees Generated
  console.log("🔍 Verifying Generated Fees...");
  let fees = await getStudentFees(studentId);
  console.log(`Found ${fees.length} fees.`);

  const admissionFee = fees.find((f) => f.feeHeadId === admissionHead.id);
  const tuitionFee = fees.find((f) => f.feeHeadId === tuitionHead.id);

  if (admissionFee && tuitionFee) {
    console.log("✅ Both ONE_TIME and MONTHLY fees generated.");
    console.log(
      `   Admission: ${admissionFee.amount}, Status: ${admissionFee.status}`,
    );
    console.log(
      `   Tuition: ${tuitionFee.amount}, Status: ${tuitionFee.status}`,
    );
  } else {
    console.error("❌ Missing expected fees.", { admissionFee, tuitionFee });
    return; // Stop if failed
  }

  // 4. Verify Account Balance
  const account = await prisma.studentAccount.findUnique({
    where: { studentId },
  });
  const expectedBalance = 5000 + 2000;
  if (account?.balance === expectedBalance) {
    console.log(`✅ Account Balance Correct: ${account.balance}`);
  } else {
    console.error(
      `❌ Incorrect Balance. Expected ${expectedBalance}, Got ${account?.balance}`,
    );
  }

  // 5. Test Partial Payment
  console.log("💳 Testing Partial Payment (1000 on Tuition)...");
  await payFee(tuitionFee.id, 1000);

  // 6. Verify After Payment
  fees = await getStudentFees(studentId);
  const updatedTuition = fees.find((f) => f.id === tuitionFee.id);
  const updatedAccount = await prisma.studentAccount.findUnique({
    where: { studentId },
  });

  if (
    updatedTuition?.status === "PARTIALLY_PAID" &&
    updatedTuition.paidAmount === 1000
  ) {
    console.log("✅ Tuition Fee Status Updated to PARTIALLY_PAID");
  } else {
    console.error("❌ Tuition Fee Status Validation Failed", updatedTuition);
  }

  const expectedNewBalance = 7000 - 1000;
  if (updatedAccount?.balance === expectedNewBalance) {
    console.log(
      `✅ Account Balance Updated Correctly: ${updatedAccount.balance}`,
    );
  } else {
    console.error(
      `❌ Account Balance Validation Failed. Expected ${expectedNewBalance}, Got ${updatedAccount?.balance}`,
    );
  }

  // Cleanup (Optional, but good for repetitive runs)
  //   await prisma.student.delete({ where: { id: studentId } });
  //   await prisma.class.delete({ where: { id: testClass.id } });
  //   await prisma.feeHead.delete({ where: { id: admissionHead.id } });
  //   await prisma.feeHead.delete({ where: { id: tuitionHead.id } });

  console.log("🎉 Verification Complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
