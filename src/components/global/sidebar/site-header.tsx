"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import BellNotification from "@/components/global/sidebar/Bell";
import UserNavButton from "@/components/global/sidebar/user-nav";
import ThemeToggle from "@/components/global/sidebar/ThemeToogle";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getBreadcrumbs, getPageTitleFromBreadcrumbs } from "@/lib/setting";
import { Role } from "@/generated/prisma/enums";
import { Notifications } from "@/generated/prisma/client";

interface HeaderProps {
  user: {
    id: string;
    role: Role;
    email: string | null;
    username: string;
    imageURL: string | null;
  } | null;
  notifications:
    | (Notifications & {
        user: {
          id: string;
          role: Role;
          username: string;
          imageURL: string | null;
        };
      })[]
    | null;
}

export function SiteHeader({ user, notifications }: HeaderProps) {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);
  const title = getPageTitleFromBreadcrumbs(breadcrumbs);

  return (
    <header className='flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)'>
      <div className='flex w-full items-center gap-1 px-2 lg:gap-2 lg:px-6'>
        <SidebarTrigger className='lg:hidden' />
        <Separator orientation='vertical' className='h-6 lg:hidden' />

        {/* Breadcrumbs (desktop) + title (mobile) */}
        <div className='flex flex-col gap-0.5'>
          {/* Mobile: just title */}
          <h1 className='lg:hidden md:text-base text-sm font-medium'>
            {title}
          </h1>

          {/* Desktop: Breadcrumbs */}
          <Breadcrumb className='hidden lg:flex'>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.href}>
                  <BreadcrumbItem>
                    {crumb.isCurrent ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={crumb.href}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className='ml-auto flex items-center gap-3'>
          <BellNotification user={user} notifications={notifications} />
          <UserNavButton user={user} />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
