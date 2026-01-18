"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navConfig } from "@/config/nav";
import { Role } from "@/generated/prisma/enums";

interface SidebarProps {
  role: Role;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const items = navConfig[role] || [];

  return (
    <div className='hidden border-r bg-muted/40 md:block w-64 flex-col fixed inset-y-0 left-0 bg-background'>
      <div className='flex h-14 items-center border-b px-6 lg:h-[60px]'>
        <Link href='/' className='flex items-center gap-2 font-semibold'>
          <div className='h-8 w-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold'>
            S
          </div>
          <span className=''>Schola</span>
        </Link>
      </div>
      <div className='flex-1 overflow-auto py-2'>
        <nav className='grid items-start px-4 text-sm font-medium'>
          {items.map((item, index) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                  isActive
                    ? "bg-muted text-primary"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                <Icon className='h-4 w-4' />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
