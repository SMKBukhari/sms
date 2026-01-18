"use client";

import { useState } from "react";
import { Bell, CheckCheck, Loader2, RefreshCw } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { NotificationList } from "@/components/global/sidebar/NotificationList";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Notifications, Role } from "@/generated/prisma/client";

interface BellNotificationProps {
  user: {
    role: Role;
    username: string;
    id: string;
    email: string | null;
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

const BellNotification = ({ user, notifications }: BellNotificationProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [open, setOpen] = useState(false);
  const [removedNotifications, setRemovedNotifications] = useState<string[]>(
    [],
  );

  const router = useRouter();
  const isMobile = useIsMobile();

  const unreadCount =
    notifications?.filter(
      (n) => !n.isRead && !removedNotifications.includes(n.id),
    ).length || 0;
  const displayList = notifications || [];

  const onRefresh = async () => {
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const onMarkAllRead = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      // TODO: Create Action for this
      setRemovedNotifications(
        displayList.filter((n) => !n.isRead).map((n) => n.id),
      );
      toast.success("All marked as read");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const onReadOne = async (notificationId: string) => {
    try {
      // TODO: Create Action for this
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const HeaderActions = () => (
    <div className='flex items-center gap-2'>
      <Button
        variant='outline'
        size='icon'
        onClick={onRefresh}
        disabled={isRefreshing}
      >
        <RefreshCw
          className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
        />
      </Button>
      <Button
        variant='outline'
        size='icon'
        onClick={onMarkAllRead}
        disabled={isLoading || unreadCount === 0}
      >
        {isLoading ? (
          <Loader2 className='w-4 h-4 animate-spin' />
        ) : (
          <CheckCheck className='w-4 h-4' />
        )}
      </Button>
    </div>
  );

  const TriggerButton = () => (
    <Button variant='outline' size='icon' className='relative bg-background'>
      <Bell className='w-5 h-5' />
      {unreadCount >= 1 && (
        <span className='absolute -top-1 -right-1 flex h-2 w-2 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white'></span>
      )}
    </Button>
  );

  // MOBILE VIEW: Full Sheet (looks like a page)
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <div onClick={() => setOpen(true)}>
            <TriggerButton />
          </div>
        </DrawerTrigger>
        <DrawerContent className='px-0'>
          <DrawerHeader className='px-4 pb-2 border-b flex flex-row items-center justify-between'>
            <DrawerTitle>Notifications</DrawerTitle>
            <div className='-mt-2'>
              <HeaderActions />
            </div>
          </DrawerHeader>
          <NotificationList
            notifications={displayList}
            onRead={onReadOne}
            removedIds={removedNotifications}
          />
        </DrawerContent>
      </Drawer>
    );
  }

  // DESKTOP VIEW: Popover
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div>
          <TriggerButton />
        </div>
      </PopoverTrigger>
      <PopoverContent className='w-[380px] p-0' align='end'>
        <div className='flex items-center justify-between px-4 py-2 border-b border-primary-border bg-sidebar/30'>
          <h4 className='font-semibold text-sm'>Notifications</h4>
          <HeaderActions />
        </div>
        <NotificationList
          notifications={displayList}
          onRead={onReadOne}
          removedIds={removedNotifications}
        />
        <div className='p-2 border-t bg-muted/30'>
          <Button
            variant='outline'
            className='w-full h-8 text-xs'
            onClick={() => router.push("/notifications")}
          >
            View History
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default BellNotification;
