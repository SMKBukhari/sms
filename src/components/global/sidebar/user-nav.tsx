"use client";
import React, { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Role } from "@/generated/prisma/enums";
import { ChevronDown, ChevronUp } from "lucide-react";
import UserPopover from "@/components/global/sidebar/UserPopover";
import { useTheme } from "next-themes";

interface UserNavButtonProps {
  user: {
    id: string;
    role: Role;
    email: string | null;
    username: string;
    imageURL: string | null;
  } | null;
}

const UserNavButton = ({ user }: UserNavButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { resolvedTheme } = useTheme();

  const avatarFallback = user?.username?.substring(0, 2).toUpperCase();

  const userImage = () => {
    if (resolvedTheme === "dark") {
      return "/img/user_dark.png";
    } else {
      return "/img/user_light.png";
    }
  };

  const chevronIcon = () => {
    setIsOpen(!isOpen);
  };
  return (
    <Popover onOpenChange={chevronIcon}>
      <PopoverTrigger className='flex items-center cursor-pointer gap-2'>
        {user?.imageURL ? (
          <Avatar className='rounded-lg'>
            <AvatarImage
              className='object-cover w-full h-full object-center'
              src={user.imageURL}
            />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
        ) : (
          <Avatar>
            <AvatarImage src={userImage()} />
            <AvatarFallback>{avatarFallback}</AvatarFallback>
          </Avatar>
        )}
        {isOpen ? (
          <ChevronUp className='w-4 h-4 md:block hidden' />
        ) : (
          <ChevronDown className='w-4 h-4 md:block hidden' />
        )}
      </PopoverTrigger>
      <PopoverContent className='md:w-64 w-52'>
        <UserPopover userProfile={user} />
      </PopoverContent>
    </Popover>
  );
};

export default UserNavButton;
