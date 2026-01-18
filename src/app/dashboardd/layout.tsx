import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { username: true, role: true },
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className='flex min-h-screen w-full flex-col bg-muted/40 md:flex-row'>
      <Sidebar role={user.role} />
      <div className='flex flex-col sm:gap-4 sm:py-4 md:pl-64 w-full'>
        <Topbar user={user} />
        <main className='flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8'>
          {children}
        </main>
      </div>
    </div>
  );
}
