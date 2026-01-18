"use client";

import { logoutUser } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Role } from "@/generated/prisma/enums";
import { FolderKanban, LogOut, Menu, User } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar"; // Reuse for mobile

interface TopbarProps {
  user: {
    username: string;
    role: Role;
  };
}

export function Topbar({ user }: TopbarProps) {
  return (
    <header className='flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 sticky top-0 bg-background z-10 w-full'>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant='outline' size='icon' className='shrink-0 md:hidden'>
            <Menu className='h-5 w-5' />
            <span className='sr-only'>Toggle navigation</span>
          </Button>
        </SheetTrigger>
        <SheetContent side='left' className='flex flex-col p-0'>
          {/* Mobile Sidebar Logic can be adapted here, or just reuse Sidebar content logic */}
          <div className='p-6'>
            <div className='flex items-center gap-2 font-semibold mb-6'>
              <div className='h-8 w-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-bold'>
                S
              </div>
              <span>Schola</span>
            </div>
            {/* We would need to pass role to mobile nav as well, implementing simple version for now */}
          </div>
        </SheetContent>
      </Sheet>
      <div className='w-full flex-1'>
        {/* Search or Breadcrumbs could go here */}
      </div>
      <div className='flex items-center gap-4'>
        <div className='flex flex-col items-end mr-2 hidden md:flex'>
          <span className='text-sm font-medium leading-none'>
            {user.username}
          </span>
          <span className='text-xs text-muted-foreground'>{user.role}</span>
        </div>
        <Button
          variant='ghost'
          size='icon'
          className='rounded-full'
          onClick={() => logoutUser()}
          title='Logout'
        >
          <LogOut className='h-5 w-5' />
        </Button>
      </div>
    </header>
  );
}
