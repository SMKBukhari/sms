import { AppSidebar } from "@/components/global/sidebar/app-sidebar";
import { SiteHeader } from "@/components/global/sidebar/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
// import { db } from "@/lib/db";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "SMS | School Management System",
  description:
    "A School Management System for schools and educational institutions",
};

const ProtectedLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      username: true,
      role: true,
      id: true,
      imageURL: true,
      email: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const notifications = await prisma.notifications.findMany({
    where: {
      userId: user.id,
    },
    include: {
      user: {
        include: {
          student: {
            select: {
              fullName: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return (
    <SidebarProvider
      style={
        {
          "--header-height": "calc(var(--spacing) * 14)",
        } as React.CSSProperties
      }
    >
      <AppSidebar user={user} variant='inset' />
      <SidebarInset className='bg-background!'>
        <SiteHeader user={user} notifications={notifications} />
        <main className='p-6 space-y-6'>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ProtectedLayout;
