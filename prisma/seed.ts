import { Role } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";

async function main() {
  console.log("🌱 Starting seed...");

  // // 1. Create Admin
  // const adminUser = await prisma.user.upsert({
  //   where: { username: "admin" },
  //   update: {},
  //   create: {
  //     username: "admin",
  //     password: "adminpasswordhash", // In real app, this should be hashed
  //     role: Role.ADMIN,
  //     name: "Oscar Hansen",
  //     email: "admin@schola.com",
  //   },
  // });
  // console.log("✅ Admin created:", adminUser.username);

  // // 2. Create Teachers
  // const teacherUsers = [
  //   { name: "John Smith", email: "john@schola.com", username: "john" },
  //   { name: "Sarah Connor", email: "sarah@schola.com", username: "sarah" },
  // ];

  // for (const t of teacherUsers) {
  //   const user = await prisma.user.upsert({
  //     where: { username: t.username },
  //     update: {},
  //     create: {
  //       username: t.username,
  //       password: "password123",
  //       role: Role.TEACHER,
  //       email: t.email,
  //     },
  //   });

  //   await prisma.teacher.create({
  //     data: {
  //       userId: user.id,
  //       fullName: t.name,
  //       qualification: "M.Ed",
  //       experience: "5 Years",
  //     },
  //   });
  // }
  // console.log("✅ Teachers created");

  // 3. Create Classes & Subjects
  const grade10 = await prisma.class.create({
    data: {
      name: "Grade 10",
      capacity: 30,
    },
  });

  const grade9 = await prisma.class.create({
    data: {
      name: "Grade 9",
      capacity: 30,
    },
  });

  const math = await prisma.subject.create({
    data: {
      name: "Mathematics",
      code: "MTH101",
      classes: { connect: [{ id: grade10.id }, { id: grade9.id }] },
    },
  });
  console.log("✅ Classes & Subjects created");

  // 4. Create Fee Heads & Structures
  const tuitionFee = await prisma.feeHead.create({
    data: { name: "Tuition Fee", description: "Monthly tuition" },
  });

  const libraryFee = await prisma.feeHead.create({
    data: { name: "Library Fee", description: "Yearly access" },
  });

  await prisma.feeStructure.create({
    data: {
      classId: grade10.id,
      feeHeadId: tuitionFee.id,
      amount: 3500,
      dueDate: "5th of Month",
    },
  });

  await prisma.feeStructure.create({
    data: {
      classId: grade9.id,
      feeHeadId: tuitionFee.id,
      amount: 3000,
      dueDate: "5th of Month",
    },
  });
  console.log("✅ Fee Structures created");

  // 5. Create Students with Accounts & Transactions
  const studentsData = [
    { name: "Michael Chen", classId: grade10.id, roll: "101" },
    { name: "Emma Williams", classId: grade10.id, roll: "102" },
    { name: "Rajesh Kumar", classId: grade10.id, roll: "103" },
    { name: "Hannah Lee", classId: grade9.id, roll: "901" },
    { name: "Thomas Green", classId: grade9.id, roll: "902" },
  ];

  for (const s of studentsData) {
    const user = await prisma.user.create({
      data: {
        username: s.name.toLowerCase().replace(" ", ""),
        password: "password123",
        role: Role.STUDENT,
        name: s.name,
      },
    });

    const student = await prisma.student.create({
      data: {
        userId: user.id,
        classId: s.classId,
        rollNo: s.roll,
        gender: Gender.MALE, // Simplified for brevity
        dob: new Date("2010-01-01"),
      },
    });

    // Create Account
    const account = await prisma.studentAccount.create({
      data: {
        studentId: student.id,
        balance: 1000, // Initial debt
      },
    });

    // Add Initial Transaction (Debit - Fee Applied)
    await prisma.transaction.create({
      data: {
        accountId: account.id,
        amount: 3500,
        type: TransactionType.DEBIT,
        description: "Tuition Fee - Jan",
      },
    });

    // Add Payment (Credit - Fee Paid)
    await prisma.transaction.create({
      data: {
        accountId: account.id,
        amount: 2500,
        type: TransactionType.CREDIT,
        description: "Part Payment",
      },
    });
  }
  console.log("✅ 5 Students with Accounts created");

  console.log("🌱 Seed finished.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
