"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, Trash } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createSection, deleteSection } from "@/actions/settings/academic";
import EmptyState from "@/components/global/EmptyState";

const formSchema = z.object({
  name: z.string().min(1, "Section name is required"),
  classId: z.string().min(1, "Class is required"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
});

interface SectionManagerProps {
  initialSections: any[];
  classes: any[];
}

export default function SectionManager({
  initialSections,
  classes,
}: SectionManagerProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", classId: "", capacity: 40 },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(() => {
      createSection(values).then((result) => {
        if (result.success) {
          toast.success(result.message);
          setOpen(false);
          form.reset();
        } else {
          toast.error(result.message);
        }
      });
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure? This will remove the section.")) {
      startTransition(() => {
        deleteSection(id).then((result) => {
          if (result.success) toast.success(result.message);
          else toast.error(result.message);
        });
      });
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-bold tracking-tight'>Sections</h2>
          <p className='text-sm text-muted-foreground'>
            Manage class sections and student capacity.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 h-4 w-4' /> Add Section
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Section</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className='space-y-4'
              >
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Section Name</FormLabel>
                      <FormControl>
                        <Input placeholder='e.g. A, B, Rose' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='classId'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select Class' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {classes.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='capacity'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity</FormLabel>
                      <FormControl>
                        <Input
                          type='number'
                          placeholder='40'
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type='submit' disabled={isPending}>
                    {isPending && (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    )}
                    Create Section
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {initialSections.length === 0 ? (
        <EmptyState
          title='No sections found'
          description='Create sections to assign students.'
          icon={<Plus />}
        />
      ) : (
        <div className='border rounded-lg'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Section</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead className='w-[70px]'></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialSections.map((sec) => (
                <TableRow key={sec.id}>
                  <TableCell className='font-medium'>{sec.name}</TableCell>
                  <TableCell>{sec.class.name}</TableCell>
                  <TableCell>{sec._count.students}</TableCell>
                  <TableCell>{sec.capacity}</TableCell>
                  <TableCell>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 text-red-600'
                      onClick={() => handleDelete(sec.id)}
                    >
                      <Trash className='h-4 w-4' />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
