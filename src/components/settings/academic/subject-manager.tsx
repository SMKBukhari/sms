"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Book, Check, Loader2, Plus, Trash } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  assignSubjectToClass,
  createSubject,
  deleteSubject,
} from "@/actions/settings/academic";
import EmptyState from "@/components/global/EmptyState";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import Dialog from "@/components/global/CustomDialog";
import CustomFormField from "@/components/global/CustomFormField";
import { FormFieldType } from "@/lib/enums";

const formSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  code: z.string().optional(),
});

interface SubjectManagerProps {
  initialSubjects: any[];
  classes: any[];
}

export default function SubjectManager({
  initialSubjects,
  classes,
}: SubjectManagerProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", code: "" },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      const result = await createSubject(values.name, values.code);
      if (result.success) {
        toast.success(result.message);
        setOpen(false);
        form.reset();
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure?")) {
      startTransition(async () => {
        const result = await deleteSubject(id);
        if (result.success) toast.success(result.message);
        else toast.error(result.message);
      });
    }
  };

  const openAssign = (subject: any) => {
    setSelectedSubject(subject);
    // Pre-select classes that already have this subject
    // Note: server action returns subjects with _count, but we need the actual classes relation to pre-fill.
    // The current getSubjects only includes _count.
    // I need to update getSubjects to include `classes: { select: { id: true } }`
    // OR just fetch it when opening. For now, assuming distinct separation,
    // I will modify getSubjects in the server action to include relations or handle it here if present.
    // OPTIMIZATION: I'll accept that initialSubjects might need to be richer.
    // Actually, let's fix the server action in next step if needed, or just assume empty for now and fix later.
    // Wait, the user wants "connect with classes".
    // I'll check `subject.classes` if available.
    if (subject.classes) {
      setSelectedClasses(subject.classes.map((c: any) => c.id));
    } else {
      setSelectedClasses([]);
    }
    setAssignOpen(true);
  };

  const handleAssignSubmit = () => {
    if (!selectedSubject) return;
    startTransition(async () => {
      const result = await assignSubjectToClass(
        selectedSubject.id,
        selectedClasses,
      );
      if (result.success) {
        toast.success(result.message);
        setAssignOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  };

  const toggleClass = (classId: string) => {
    setSelectedClasses((prev) =>
      prev.includes(classId)
        ? prev.filter((id) => id !== classId)
        : [...prev, classId],
    );
  };

  const AddSubjectForm = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <div className={isMobile ? "px-0 space-y-6" : "px-5 space-y-6"}>
          <CustomFormField
            control={form.control}
            name='name'
            label='Subject Name'
            isRequired
            placeholder='Enter subject name'
            fieldType={FormFieldType.INPUT}
          />
          <CustomFormField
            control={form.control}
            name='code'
            label='Subject Code'
            placeholder='Enter subject code'
            fieldType={FormFieldType.INPUT}
          />
          {/* Footer Actions - Only visible in Dialog, Drawer has its own fixed footer if needed, 
                        but we include it here for flow, and might sticky it in mobile */}
          {!isMobile && (
            <Dialog.Footer>
              <div className='flex gap-3'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => {
                    setOpen(false);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  variant={"default"} // Changed from primary to default as primary might not be defined in variant props
                  className='bg-primary hover:bg-primary/90'
                  disabled={isPending} // Use isPending instead of loading
                >
                  {isPending ? (
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  ) : (
                    "Create Subject"
                  )}
                </Button>
              </div>
            </Dialog.Footer>
          )}

          {/* Mobile Footer (In-flow) */}
          {isMobile && (
            <div className='flex flex-col gap-3 pt-4 mt-4 border-t border-border'>
              <Button
                type='submit'
                className='bg-primary hover:bg-primary/90 w-full'
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : (
                  "Create Subject"
                )}
              </Button>
              <Button
                type='button'
                variant='outline'
                className='w-full'
                onClick={() => {
                  setOpen(false);
                  form.reset();
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </form>
    </Form>
  );

  const assignSubjectToClassForm = (
    <>
      <ScrollArea className='h-[300px] pr-4'>
        <div className='space-y-4'>
          {classes.map((cls) => (
            <div
              key={cls.id}
              className='flex items-center space-x-2 border p-3 rounded-md'
            >
              <Checkbox
                id={`cls-${cls.id}`}
                checked={selectedClasses.includes(cls.id)}
                onCheckedChange={() => toggleClass(cls.id)}
              />
              <label
                htmlFor={`cls-${cls.id}`}
                className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1'
              >
                {cls.name}
              </label>
            </div>
          ))}
        </div>

        {!isMobile && (
          <Dialog.Footer>
            <div className='flex gap-3'>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  setOpen(false);
                  form.reset();
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAssignSubmit}
                variant={"default"} // Changed from primary to default as primary might not be defined in variant props
                className='bg-primary hover:bg-primary/90'
                type='button'
                disabled={isPending} // Use isPending instead of loading
              >
                {isPending ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : (
                  "Assign"
                )}
              </Button>
            </div>
          </Dialog.Footer>
        )}

        {/* Mobile Footer (In-flow) */}
        {isMobile && (
          <div className='flex flex-col gap-3 pt-4 mt-4 border-t border-border'>
            <Button
              onClick={handleAssignSubmit}
              type='button'
              className='bg-primary hover:bg-primary/90 w-full'
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              ) : (
                "Assign"
              )}
            </Button>
            <Button
              type='button'
              variant='outline'
              className='w-full'
              onClick={() => {
                setOpen(false);
                form.reset();
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </ScrollArea>
    </>
  );

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-xl font-bold tracking-tight'>Subjects</h2>
          <p className='text-sm text-muted-foreground'>
            Manage subjects and assign them to classes.
          </p>
        </div>
        <>
          <Button onClick={() => setOpen(true)}>
            <Plus className='mr-2 h-4 w-4' /> Add Student
          </Button>

          {isMobile ? (
            <Drawer open={open} onOpenChange={setOpen}>
              <DrawerContent className='max-h-[95vh]'>
                <DrawerHeader className='text-left'>
                  <DrawerTitle>Add New Student</DrawerTitle>
                  <DrawerDescription>
                    Fill in the details to create a new student record.
                  </DrawerDescription>
                </DrawerHeader>
                <div className='px-4 pb-8 overflow-y-auto'>
                  {AddSubjectForm}
                </div>
              </DrawerContent>
            </Drawer>
          ) : (
            <Dialog
              isOpen={open}
              onClose={() => setOpen(false)}
              position='center'
              title='Add New Subject'
              size='xl'
              autoHeight
            >
              {AddSubjectForm}
            </Dialog>
          )}
        </>
      </div>

      {initialSubjects.length === 0 ? (
        <EmptyState
          title='No subjects found'
          description='Create subjects to assign to classes.'
          icon={<Book />}
        />
      ) : (
        <div className='border rounded-lg'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Assigned Classes</TableHead>
                <TableHead>Teachers</TableHead>
                <TableHead className='w-[150px]'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {initialSubjects.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell className='font-mono text-xs'>
                    {sub.code || "-"}
                  </TableCell>
                  <TableCell className='font-medium'>{sub.name}</TableCell>
                  <TableCell>
                    <Badge variant='secondary' className='mr-2'>
                      {sub._count?.classes || 0} Classes
                    </Badge>
                  </TableCell>
                  <TableCell>{sub._count?.teachers || 0}</TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      <Button
                        variant='outline'
                        size='sm'
                        onClick={() => openAssign(sub)}
                      >
                        Assign
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-8 w-8 text-red-600'
                        onClick={() => handleDelete(sub.id)}
                      >
                        <Trash className='h-4 w-4' />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Assign Subject Dialog */}
          <Button onClick={() => setAssignOpen(true)}>
            <Plus className='mr-2 h-4 w-4' /> Assign Subject
          </Button>
          {isMobile ? (
            <Drawer open={assignOpen} onOpenChange={setAssignOpen}>
              <DrawerContent className='max-h-[95vh]'>
                <DrawerHeader className='text-left'>
                  <DrawerTitle>Assign Subject</DrawerTitle>
                  <DrawerDescription>
                    Fill in the details to assign a subject to classes.
                  </DrawerDescription>
                </DrawerHeader>
                <div className='px-4 pb-8 overflow-y-auto'>
                  {assignSubjectToClassForm}
                </div>
              </DrawerContent>
            </Drawer>
          ) : (
            <Dialog
              isOpen={assignOpen}
              onClose={() => setAssignOpen(false)}
              position='center'
              title='Assign Subject'
              size='xl'
              autoHeight
            >
              {assignSubjectToClassForm}
            </Dialog>
          )}
        </div>
      )}
    </div>
  );
}
