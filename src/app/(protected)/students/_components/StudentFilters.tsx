"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface ClassOption {
  id: string;
  name: string;
  sections: { id: string; name: string }[];
}

interface StudentFiltersProps {
  classes: ClassOption[];
  initialFilters: {
    search: string;
    classId: string;
    sectionId: string;
  };
}

export function StudentFilters({
  classes,
  initialFilters,
}: StudentFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(window.location.search);
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const handleClassChange = (classId: string) => {
    const params = new URLSearchParams(window.location.search);
    if (classId === "all") {
      params.delete("classId");
      params.delete("sectionId");
    } else {
      params.set("classId", classId);
      params.delete("sectionId"); // Reset section when class changes
    }
    params.set("page", "1");
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const handleSectionChange = (sectionId: string) => {
    const params = new URLSearchParams(window.location.search);
    if (sectionId === "all") {
      params.delete("sectionId");
    } else {
      params.set("sectionId", sectionId);
    }
    params.set("page", "1");
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  };

  const selectedClass = classes.find((c) => c.id === initialFilters.classId);

  return (
    <div className='flex flex-col gap-4 md:flex-row md:items-center'>
      <div className='relative flex-1'>
        <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
        <Input
          type='search'
          placeholder='Search by name, roll no...'
          className='pl-8'
          defaultValue={initialFilters.search}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>
      <Select
        defaultValue={initialFilters.classId || "all"}
        onValueChange={handleClassChange}
      >
        <SelectTrigger className='w-[180px]'>
          <SelectValue placeholder='Select Class' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Classes</SelectItem>
          {classes.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        defaultValue={initialFilters.sectionId || "all"}
        onValueChange={handleSectionChange}
        disabled={!initialFilters.classId}
      >
        <SelectTrigger className='w-[180px]'>
          <SelectValue placeholder='Select Section' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>All Sections</SelectItem>
          {selectedClass?.sections.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
