import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Banknote,
  Settings,
  CalendarCheck,
  ClipboardList,
  UserCircle,
} from "lucide-react";
import { Role } from "@/generated/prisma/enums";

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

export const navConfig: Record<Role, NavItem[]> = {
  ADMIN: [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Students", href: "/students", icon: GraduationCap },
    { title: "Teachers", href: "/teachers", icon: Users },
    { title: "Finance", href: "/finance", icon: Banknote },
    { title: "Settings", href: "/settings", icon: Settings },
  ],
  TEACHER: [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Assigned Classes", href: "/classes", icon: Users },
    { title: "Attendance", href: "/attendance", icon: CalendarCheck },
    { title: "Results", href: "/results", icon: ClipboardList },
    { title: "Students", href: "/students", icon: GraduationCap },
  ],
  STUDENT: [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "My Fees", href: "/fees", icon: Banknote },
    { title: "My Results", href: "/results", icon: ClipboardList },
    { title: "Profile", href: "/profile", icon: UserCircle },
  ],
  PARENT: [
    // Future scope
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  ],
};
