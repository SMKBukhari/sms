import { formatDistanceToNowStrict, isToday, isYesterday } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Notifications, Role } from "@/generated/prisma/client";

type NotificationWithUser = Notifications & {
  user: { id: string; role: Role; username: string; imageURL: string | null };
  senderImage?: string | null; // Optional if it comes from raw query or relation
};

interface NotificationListProps {
  notifications: NotificationWithUser[];
  onRead: (id: string) => void;
  removedIds: string[];
}

export const NotificationList = ({
  notifications,
  onRead,
  removedIds,
}: NotificationListProps) => {
  // Helper to group by date
  const groupedNotifications = (data: NotificationWithUser[]) => {
    const groups: { [key: string]: NotificationWithUser[] } = {
      Today: [],
      Yesterday: [],
      Older: [],
    };

    data.forEach((item) => {
      const date = new Date(item.createdAt);
      if (isToday(date)) groups.Today.push(item);
      else if (isYesterday(date)) groups.Yesterday.push(item);
      else groups.Older.push(item);
    });

    return groups;
  };

  const renderGroup = (list: NotificationWithUser[]) => {
    if (list.length === 0) return null;
    return (
      <div className='flex flex-col gap-1'>
        {list.map((n) => (
          <NotificationItem
            key={n.id}
            notification={n}
            onRead={onRead}
            isRemoved={removedIds.includes(n.id)}
          />
        ))}
      </div>
    );
  };

  const allGroups = groupedNotifications(notifications);
  const unreadGroups = groupedNotifications(
    notifications.filter((n) => !n.isRead),
  );

  return (
    <Tabs defaultValue='all' className='w-full'>
      <div className='px-4 pt-2'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='all'>All</TabsTrigger>
          <TabsTrigger value='unread'>
            Unread ({notifications.filter((n) => !n.isRead).length})
          </TabsTrigger>
        </TabsList>
      </div>

      <ScrollArea className='h-[400px] md:h-[350px] mt-1'>
        <TabsContent value='all' className='px-3 pb-2 flex flex-col gap-4'>
          {allGroups.Today.length > 0 && (
            <div>
              <h4 className='text-xs font-semibold text-muted-foreground mb-2 mt-2'>
                Today
              </h4>
              {renderGroup(allGroups.Today)}
            </div>
          )}
          {allGroups.Yesterday.length > 0 && (
            <div>
              <h4 className='text-xs font-semibold text-muted-foreground mb-2 mt-4'>
                Yesterday
              </h4>
              {renderGroup(allGroups.Yesterday)}
            </div>
          )}
          {allGroups.Older.length > 0 && (
            <div>
              <h4 className='text-xs font-semibold text-muted-foreground mb-2 mt-4'>
                Older
              </h4>
              {renderGroup(allGroups.Older)}
            </div>
          )}
          {notifications.length === 0 && <EmptyState />}
        </TabsContent>

        <TabsContent value='unread' className='px-4 pb-4 flex flex-col gap-4'>
          {renderGroup(unreadGroups.Today)}
          {renderGroup(unreadGroups.Yesterday)}
          {renderGroup(unreadGroups.Older)}
          {notifications.filter((n) => !n.isRead).length === 0 && (
            <EmptyState />
          )}
        </TabsContent>
      </ScrollArea>
    </Tabs>
  );
};

// Sub-component for individual items
const NotificationItem = ({
  notification,
  onRead,
  isRemoved,
}: {
  notification: NotificationWithUser;
  onRead: (id: string) => void;
  isRemoved: boolean;
}) => {
  const avatarFallback =
    notification.user?.username?.substring(0, 2).toUpperCase() || "SY";

  // IMAGE LOGIC: Implementing your requested logic here
  const renderImage = () => {
    // Case 1: System/Account Notification
    if (notification.createdBy === "System") {
      return (
        <div className='w-9 h-9 flex items-center justify-center bg-primary/10 rounded-full shrink-0'>
          <Settings className='w-5 h-5 text-primary' />
        </div>
      );
    }

    // Case 2: User Image or Default Fallback
    // We try senderImage, then user.userImage, then the UserImage() function
    const imageSrc =
      notification.senderImage ||
      notification.user?.imageURL ||
      "https://github.com/shadcn.png";

    return (
      <Avatar className='w-9 h-9 border border-primary-border'>
        <AvatarImage src={imageSrc} />
        <AvatarFallback>{avatarFallback}</AvatarFallback>
      </Avatar>
    );
  };

  const content = (
    <div className='flex gap-3 w-full items-start'>
      {/* Status Dot (Left side) */}
      {/* <div className={cn("w-2 h-2 mt-3 rounded-full shrink-0")} /> */}

      {/* Dynamic Image Component based on your logic */}
      {renderImage()}

      {/* Content Text */}
      <div className='flex-1'>
        <div className='flex justify-between items-start'>
          <h3 className='text-sm font-medium leading-none pt-0.5'>
            {notification.title}
          </h3>
          <span className='text-[10px] text-muted-foreground whitespace-nowrap ml-2 pt-0.5'>
            {formatDistanceToNowStrict(new Date(notification.createdAt))} ago
          </span>
        </div>
        <p className='text-xs text-muted-foreground mt-1 line-clamp-2 leading-snug'>
          {notification.message}
        </p>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {!isRemoved && (
        <motion.div
          initial={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className='py-3 border-b border-primary-border last:border-0 cursor-pointer hover:bg-sidebar/50 transition-colors rounded-lg px-2'
          onClick={() => onRead(notification.id)}
        >
          {notification.link ? (
            <Link href={notification.link}>{content}</Link>
          ) : (
            content
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const EmptyState = () => (
  <div className='flex flex-col items-center justify-center py-8 text-center text-muted-foreground'>
    <div className='p-3 bg-muted rounded-full mb-3'>
      <Settings className='w-6 h-6 opacity-50' />
    </div>
    <p className='text-sm'>No notifications found</p>
  </div>
);
