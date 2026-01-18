"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, MoreHorizontal, Pencil, Plus, Trash } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createClass,
  deleteClass,
  updateClass,
} from "@/actions/settings/academic";
import EmptyState from "@/components/global/EmptyState";

const formSchema = z.object({
  name: z.string().min(1, "Class name is required"),
});

interface ClassManagerProps {
  initialClasses: any[];
}

export default function ClassManager({ initialClasses }: ClassManagerProps) {
  const [open, setOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "" },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(() => {
      const action = editingClass
        ? updateClass(editingClass.id, values.name)
        : createClass(values.name);

      action.then((result) => {
        if (result.success) {
          toast.success(result.message);
          setOpen(false);
          form.reset();
          setEditingClass(null);
        } else {
          toast.error(result.message);
        }
      });
    });
  };

  const handleDelete = (id: string) => {
    if (
      confirm("Are you sure? This will delete all related sections and data.")
    ) {
      startTransition(() => {
        deleteClass(id).then((result) => {
          if (result.success) toast.success(result.message);
          else toast.error(result.message);
        });
      });
    }
  };

  const openEdit = (cls: any) => {
    setEditingClass(cls);
    form.reset({ name: cls.name });
    setOpen(true);
  };

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-bold tracking-tight'>Classes</h2>
          <p className='text-sm text-muted-foreground'>
            Manage academic classes and their hierarchy.
          </p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(val) => {
            setOpen(val);
            if (!val) {
              setEditingClass(null);
              form.reset({ name: "" });
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 h-4 w-4' /> Add Class
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingClass ? "Edit Class" : "Add New Class"}
              </DialogTitle>
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
                      <FormLabel>Class Name</FormLabel>
                      <FormControl>
                        <Input placeholder='e.g. Grade 10' {...field} />
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
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {initialClasses.length === 0 ? (
        <EmptyState
          title='No classes found'
          description='Create your first class to get started.'
          icon={<Plus />}
        />
      ) : (
        <div className='border rounded-lg'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Sections</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead className='w-[70px]'></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialClasses.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell className='font-medium'>{cls.name}</TableCell>
                  <TableCell>{cls._count.sections}</TableCell>
                  <TableCell>{cls._count.students}</TableCell>
                  <TableCell>{cls._count.subjects}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' size='icon' className='h-8 w-8'>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem onClick={() => openEdit(cls)}>
                          <Pencil className='mr-2 h-4 w-4' /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className='text-red-600'
                          onClick={() => handleDelete(cls.id)}
                        >
                          <Trash className='mr-2 h-4 w-4' /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
