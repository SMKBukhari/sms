import {
  IconBriefcase,
  IconCalendarClock,
  IconCalendarTime,
  IconClockDollar,
  IconDashboard,
  IconDeviceMobileDollar,
  IconFileCertificate,
  IconFolderCheck,
  IconFolderExclamation,
  IconHome,
  IconNotebook,
  IconNotes,
  IconSchool,
  IconSettings,
  IconTool,
  IconUser,
  IconUserScan,
  IconUsersGroup,
} from "@tabler/icons-react";

export const COLOR_PALETTE = [
  "#3863C6",
  "#6B9408",
  "#252528",
  "#C66338",
  "#AA3D5A",
];

export const routes = {
  navMain: [
    {
      label: "Dashboard",
      icon: IconDashboard,
      href: "/dashboard",
      for: ["User", "Employee", "Manager", "Admin", "CEO"],
    },
    {
      label: "Teachers",
      icon: IconUsersGroup,
      href: "/teachers",
      for: ["Employee", "Manager", "Admin"],
    },
    {
      label: "Students",
      icon: IconSchool,
      href: "/students",
      for: ["Employee", "Manager", "Admin", "CEO"],
    },
    {
      label: "Attendance",
      icon: IconCalendarClock,
      href: "/attendance",
      for: ["Employee", "Manager", "Admin", "CEO"],
    },
    {
      label: "Exams",
      icon: IconNotes,
      href: "/exams",
      for: ["Employee", "Manager", "Admin", "CEO"],
    },
    {
      label: "Finance",
      icon: IconDeviceMobileDollar,
      href: "/finance",
      for: ["Employee", "Manager", "Admin", "CEO"],
    },
    {
      label: "Account Settings",
      icon: IconSettings,
      href: "/settings",
      for: ["User", "Employee", "Manager", "Admin", "CEO"],
    },
  ],
};
