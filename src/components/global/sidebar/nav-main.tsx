"use client";

import { type Icon } from "@tabler/icons-react";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavMain({
  items,
}: {
  items: {
    label: string;
    href: string;
    icon?: Icon;
  }[];
}) {
  const pathName = usePathname();
  const isActive = (href: string) =>
    pathName === href || pathName.startsWith(`${href}/`);
  return (
    <SidebarGroup>
      <SidebarGroupLabel className='-ml-1.5 text-sm font-semibold'>
        Main Menu
      </SidebarGroupLabel>
      <SidebarGroupContent className='flex flex-col gap-2'>
        <SidebarMenu className='flex gap-2'>
          {items.map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={isActive(item.href)}
                  tooltip={item.label}
                  className={`cursor-pointer hover:bg-primary hover:text-primary-foreground! rounded-lg py-4.5 ${
                    isActive(item.href)
                      ? "bg-primary! text-primary-foreground!"
                      : "text-muted-foreground!"
                  }`}
                >
                  {item.icon && (
                    <item.icon
                      className={`w-5! h-5! text-xl${
                        isActive(item.href)
                          ? "text-primary-foreground"
                          : "text-muted-foreground!"
                      }`}
                    />
                  )}
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
