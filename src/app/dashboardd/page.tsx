import { requireAuth } from "@/lib/auth";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { TeacherDashboard } from "@/components/dashboard/TeacherDashboard";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { Role } from "@/generated/prisma/enums";

export default async function DashboardPage() {
  const session = await requireAuth();

  switch (session.role) {
    case Role.ADMIN:
      return <AdminDashboard />;
    case Role.TEACHER:
      return <TeacherDashboard />;
    case Role.STUDENT:
      return <StudentDashboard />;
    case Role.PARENT:
      return <div>Parent Dashboard Coming Soon</div>;
    default:
      return <div>Unknown Access</div>;
  }
}
