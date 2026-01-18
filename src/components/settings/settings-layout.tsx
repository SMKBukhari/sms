"use client";

import { cn } from "@/lib/utils";
import { Book, Building2, CreditCard, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const sidebarItems = [
  {
    title: "Academic",
    items: [
      {
        title: "Classes",
        href: "/settings/academic/classes",
        icon: Building2,
      },
      {
        title: "Sections",
        href: "/settings/academic/sections",
        icon: Users,
      },
      {
        title: "Subjects",
        href: "/settings/academic/subjects",
        icon: Book,
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        title: "Fee Structures",
        href: "/settings/finance/fees",
        icon: CreditCard,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        title: "General",
        href: "/settings/system/general",
        icon: Settings,
      },
    ],
  },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className='flex flex-col md:flex-row gap-6 p-6 min-h-[calc(100vh-4rem)]'>
      <aside className='w-full md:w-64 shrink-0'>
        <div className='sticky top-6 space-y-6'>
          {sidebarItems.map((section) => (
            <div key={section.title} className='space-y-2'>
              <h4 className='font-semibold text-sm text-muted-foreground px-2'>
                {section.title}
              </h4>
              <div className='space-y-1'>
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      <item.icon className='h-4 w-4' />
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </aside>
      <main className='flex-1 bg-card rounded-lg border shadow-sm p-6'>
        {children}
      </main>
    </div>
  );
}
