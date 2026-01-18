"use client";

import { useState, useTransition } from "react";
import { createStudent } from "@/actions/createStudent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Gender } from "@/generated/prisma/enums";

interface ClassOption {
  id: string;
  name: string;
  sections: { id: string; name: string }[];
}

export function CreateStudentForm({ classes }: { classes: ClassOption[] }) {
  const [isPending, startTransition] = useTransition();
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  const selectedClass = classes.find((c) => c.id === selectedClassId);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        await createStudent(formData);
        toast.success("Student created successfully");
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Something went wrong");
        }
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='space-y-2'>
          <Label htmlFor='fullName'>Full Name</Label>
          <Input
            id='fullName'
            name='fullName'
            required
            placeholder='John Doe'
            disabled={isPending}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='admissionNo'>Admission No</Label>
          <Input
            id='admissionNo'
            name='admissionNo'
            required
            placeholder='ADM-001'
            disabled={isPending}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='rollNo'>Roll No</Label>
          <Input
            id='rollNo'
            name='rollNo'
            required
            placeholder='S-001'
            disabled={isPending}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='dob'>Date of Birth</Label>
          <Input
            id='dob'
            name='dob'
            type='date'
            required
            disabled={isPending}
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='gender'>Gender</Label>
          <Select name='gender' required disabled={isPending}>
            <SelectTrigger>
              <SelectValue placeholder='Select Gender' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={Gender.MALE}>Male</SelectItem>
              <SelectItem value={Gender.FEMALE}>Female</SelectItem>
              <SelectItem value={Gender.OTHER}>Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='password'>Initial Password</Label>
          <Input
            id='password'
            name='password'
            type='password'
            required
            defaultValue='123456'
            disabled={isPending}
          />
          <p className='text-xs text-muted-foreground'>Default: 123456</p>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='classId'>Class</Label>
          <Select
            name='classId'
            required
            onValueChange={setSelectedClassId}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue placeholder='Select Class' />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='sectionId'>Section</Label>
          <Select name='sectionId' disabled={!selectedClass || isPending}>
            <SelectTrigger>
              <SelectValue placeholder='Select Section' />
            </SelectTrigger>
            <SelectContent>
              {selectedClass?.sections.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type='submit' className='w-full' disabled={isPending}>
        {isPending ? "Creating..." : "Create Student"}
      </Button>
    </form>
  );
}
