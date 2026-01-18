import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";

const programs = [
  {
    studentName: "Fatima Noor",
    studentId: "S-2003",
    class: "7C",
    program: "Community Leadership Fellowship",
    type: "Enrichment",
    typeColor: "text-sky-500 bg-sky-50 dark:bg-sky-900/10",
    initials: "FN",
    avatarColor: "bg-pink-100 text-pink-500",
  },
  {
    studentName: "Alicia Gomez",
    studentId: "S-2001",
    class: "9B",
    program: "National Science Scholarship",
    type: "Academic Support",
    typeColor: "text-blue-500 bg-blue-50 dark:bg-blue-900/10",
    initials: "AG",
    avatarColor: "bg-purple-100 text-purple-500",
  },
  {
    studentName: "Daniel Park",
    studentId: "S-2002",
    class: "8A",
    program: "Student Athlete Sponsorship",
    type: "Finance + Enrichment",
    typeColor: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/10",
    initials: "DP",
    avatarColor: "bg-cyan-100 text-cyan-500",
  },
  {
    studentName: "Leo Ricci",
    studentId: "S-2004",
    class: "9C",
    program: "Arts & Creative Talent Grant",
    type: "Enrichment",
    typeColor: "text-sky-500 bg-sky-50 dark:bg-sky-900/10",
    initials: "LR",
    avatarColor: "bg-orange-100 text-orange-500",
  },
];

export function SpecialPrograms() {
  return (
    <div className='bg-white dark:bg-card rounded-xl border shadow-sm p-4'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='font-bold text-base'>Special Programs</h3>
        <MoreHorizontal className='h-4 w-4 text-gray-400' />
      </div>
      <div className='space-y-4'>
        {programs.map((item, i) => (
          <div key={i} className='flex items-start gap-3'>
            <Avatar className='h-10 w-10 mt-1'>
              <AvatarFallback
                className={`${item.avatarColor} font-semibold text-xs`}
              >
                {item.initials}
              </AvatarFallback>
            </Avatar>
            <div className='flex-1 space-y-0.5'>
              <div className='flex justify-between items-start'>
                <div>
                  <p className='text-sm font-semibold'>{item.studentName}</p>
                  <p className='text-xs text-gray-400'>
                    {item.studentId} • {item.class}
                  </p>
                </div>
                <Badge
                  variant='secondary'
                  className={`${item.typeColor} border-none font-medium text-[10px]`}
                >
                  {item.type}
                </Badge>
              </div>
              <p className='text-xs text-gray-600 dark:text-gray-300 font-medium pt-1'>
                {item.program}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
