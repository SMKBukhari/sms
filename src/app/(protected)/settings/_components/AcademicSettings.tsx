"use client";

import { createClass, createSection } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTransition, useState } from "react";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

type ClassWithSections = {
  id: string;
  name: string;
  sections: { id: string; name: string; capacity: number }[];
};

export function AcademicSettings({
  classes,
}: {
  classes: ClassWithSections[];
}) {
  return (
    <div className='space-y-6'>
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {/* Create Class Card */}
        <CreateClassCard />

        {/* List Classes */}
        {classes.map((cls) => (
          <ClassCard key={cls.id} cls={cls} />
        ))}
      </div>
    </div>
  );
}

function CreateClassCard() {
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await createClass(formData);
        toast.success("Class created");
        (
          document.getElementById("create-class-form") as HTMLFormElement
        ).reset();
      } catch (e) {
        toast.error("Failed to create class");
      }
    });
  }

  return (
    <Card className='border-dashed'>
      <CardHeader>
        <CardTitle>Add New Class</CardTitle>
        <CardDescription>
          Create a new grade level (e.g. Grade 1)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id='create-class-form'
          action={handleSubmit}
          className='space-y-4'
        >
          <div className='space-y-2'>
            <Label htmlFor='className'>Class Name</Label>
            <Input
              id='className'
              name='name'
              placeholder='Grade 1'
              required
              disabled={isPending}
            />
          </div>
          <Button type='submit' disabled={isPending} className='w-full'>
            <Plus className='mr-2 h-4 w-4' />
            Create Class
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function ClassCard({ cls }: { cls: ClassWithSections }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleAddSection(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.append("classId", cls.id);

    startTransition(async () => {
      try {
        await createSection(formData);
        toast.success("Section added");
        setOpen(false);
      } catch (e) {
        toast.error("Failed to add section");
      }
    });
  }

  return (
    <Card>
      <CardHeader className='flex flex-row items-baseline justify-between'>
        <CardTitle>{cls.name}</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant='outline' size='sm'>
              <Plus className='h-4 w-4' />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Section to {cls.name}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSection} className='space-y-4 py-4'>
              <div className='space-y-2'>
                <Label htmlFor='secName'>Section Name</Label>
                <Input id='secName' name='name' placeholder='A' required />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='capacity'>Capacity</Label>
                <Input
                  id='capacity'
                  name='capacity'
                  type='number'
                  defaultValue='40'
                  required
                />
              </div>
              <DialogFooter>
                <Button type='submit' disabled={isPending}>
                  Add Section
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className='flex flex-wrap gap-2'>
          {cls.sections.length > 0 ? (
            cls.sections.map((sec) => (
              <div
                key={sec.id}
                className='bg-muted px-3 py-1 rounded-md text-sm border'
              >
                {sec.name}{" "}
                <span className='text-xs text-muted-foreground ml-1'>
                  ({sec.capacity})
                </span>
              </div>
            ))
          ) : (
            <p className='text-sm text-muted-foreground'>No sections yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
