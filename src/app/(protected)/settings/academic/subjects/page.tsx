import { getClasses, getSubjects } from "@/actions/settings/academic";
import SubjectManager from "@/components/settings/academic/subject-manager";
import { prisma } from "@/lib/prisma";

export default async function SubjectsPage() {
  // Custom fetch to include classes relation for the Manager to pre-fill
  // Ideally this goes into getSubjects, but modifying it here for specificity
  const classes = await getClasses();
  const subjects = await prisma.subject.findMany({
    include: {
      classes: { select: { id: true } },
      _count: { select: { classes: true, teachers: true } },
    },
    orderBy: { name: "asc" },
  });

  return <SubjectManager initialSubjects={subjects} classes={classes} />;
}
