"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  GraduationCap,
  Edit,
  Eye,
} from "lucide-react";
import { StudentWithDetails } from "./types";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";
import Link from "next/link";

interface StudentGridProps {
  students: StudentWithDetails[];
}

export const getAvatarUrl = (user: StudentWithDetails) => {
  if (user.user.imageURL && user.user.imageURL.trim() !== "")
    return user.user.imageURL;

  const baseUrl = "https://api.dicebear.com/9.x/notionists/svg";
  const seed = encodeURIComponent(user.fullName || user.id || "user");

  // Notionists look great with warm background colors
  const baseConfig = "&backgroundColor=b6e3f4,c0aede,d1d4f9,ffdfbf";

  if (user.gender === "FEMALE") {
    // Prefer longer hair styles available in this collection
    return `${baseUrl}?seed=${seed}${baseConfig}&lips=variant01,variant05,variant12`;
  }

  if (user.gender === "MALE") {
    // Prefer beards and distinct male features
    return `${baseUrl}?seed=${seed}${baseConfig}&beard=variant02,variant03,variant05,variant06&beardProbability=100`;
  }

  return `${baseUrl}?seed=${seed}${baseConfig}`;
};

enum StudentStatus {
  ACTIVE = "ACTIVE",
  ON_LEAVE = "ON_LEAVE",
  INACTIVE = "INACTIVE",
}

export function StudentGrid({ students }: StudentGridProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (students.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-card border-dashed'>
        <Users className='h-12 w-12 text-muted-foreground mb-4' />
        <h3 className='text-lg font-semibold'>No students found</h3>
        <p className='text-muted-foreground'>
          Try adjusting your filters or search query.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial='hidden'
      animate='show'
      className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
    >
      {students.map((student) => {
        const statusColor =
          student.status === StudentStatus.ACTIVE
            ? "bg-primary-green/20 text-primary-green border-primary-green"
            : student.status === StudentStatus.ON_LEAVE
              ? "bg-primary-warning/20 text-primary-warning border-primary-warning"
              : "bg-primary-danger/20 text-primary-danger border-primary-danger";

        return (
          <motion.div key={student.id} variants={item}>
            <Card className='overflow-hidden hover:shadow-md transition-shadow duration-300 border-primary-border/60 group p-0'>
              <CardHeader className='p-0'>
                <div className='bg-linear-to-r from-primary/10 to-primary/5 h-22 relative'>
                  <Badge
                    className={`absolute top-3 right-3 ${statusColor} font-semibold`}
                  >
                    {student.status.replace("_", " ")}
                  </Badge>
                  <div className='text-right absolute bottom-0 right-3'>
                    <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                      Roll No
                    </p>
                    <p className='font-mono font-bold text-foreground'>
                      {student.rollNo}
                    </p>
                  </div>
                  <ShootingStars minDelay={1000} maxDelay={2000} />
                  <StarsBackground starDensity={0.0006} />
                </div>
                <div className='px-6 -mt-12 flex justify-between items-end'>
                  <Avatar className='h-24 w-24 border-4 border-background bg-primary-bg shadow-sm'>
                    <AvatarImage
                      src={getAvatarUrl(student) || ""}
                      alt={student.fullName}
                    />
                    <AvatarFallback className='text-xl font-bold bg-primary-bg text-primary'>
                      {student.fullName.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </CardHeader>
              <CardContent className='px-6 pb-2 space-y-4'>
                <div className='flex flex-col gap-1'>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <span className='text-xs bg-primary/20 px-2 py-0.5 rounded text-primary font-semibold'>
                      {student.admissionNo}
                    </span>
                  </div>
                  <h3 className='font-bold text-base' title={student.fullName}>
                    {student.fullName}
                  </h3>
                  <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                    <GraduationCap className='h-3.5 w-3.5' />
                    <span>
                      {student.class.name}{" "}
                      {student.section
                        ? `• Section ${student.section.name}`
                        : ""}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className='text-sm flex flex-col gap-2'>
                  <div className='flex items-center gap-3 text-muted-foreground'>
                    <Calendar className='h-4 w-4 shrink-0' />
                    <span>
                      Born {format(new Date(student.dob), "MMM d, yyyy")}
                    </span>
                  </div>
                  {student.contactNo && (
                    <div className='flex items-center gap-3 text-muted-foreground'>
                      <Phone className='h-4 w-4 shrink-0' />
                      <span>{student.contactNo}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className='px-6 py-4 flex gap-2 border-t bg-linear-to-r from-primary/10 to-primary/5 h-18 relative'>
                <Link
                  href={`/students/${student.id}`}
                  className='w-full z-9999999'
                >
                  <Button variant='primary' size='sm' className='gap-2 w-full'>
                    <Eye className='h-4 w-4' /> View
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
