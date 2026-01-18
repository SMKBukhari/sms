"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { createStudent, getClasses, getSections } from "@/actions/student";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import Dialog from "../global/CustomDialog";
import CustomFormField from "../global/CustomFormField";
import { FormFieldType } from "@/lib/enums";

const studentFormSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  admissionNo: z.string().min(1, "Admission Number is required"),
  rollNo: z.string().min(1, "Roll Number is required"),
  admissionDate: z.date(),
  dob: z.date(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  classId: z.string().min(1, "Class is required"),
  sectionId: z.string().optional(),

  // Contact
  contactNo: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),

  // Guardian
  fatherName: z.string().optional(),
  fatherContactNo: z.string().optional(),
  motherName: z.string().optional(),
  motherContactNo: z.string().optional(),
  guardianName: z.string().optional(),
  guardianRelation: z.string().optional(),
  guardianContactNo: z.string().optional(),

  imageURL: z.string().optional(),
});

type StudentFormValues = z.infer<typeof studentFormSchema>;

export default function NewStudentDialog() {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [sections, setSections] = useState<{ id: string; name: string }[]>([]);

  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      fullName: "",
      admissionNo: "",
      rollNo: "",
      admissionDate: new Date(),
      dob: new Date(),
      gender: "MALE",
      classId: "",
      sectionId: "",
      contactNo: "",
      email: "",
      address: "",
      fatherName: "",
      motherName: "",
    },
  });

  // Fetch classes on mount
  useEffect(() => {
    startTransition(async () => {
      const data = await getClasses();
      setClasses(data);
    });
  }, []);

  // Fetch sections when class changes
  const selectedClassId = form.watch("classId");
  useEffect(() => {
    if (selectedClassId) {
      startTransition(async () => {
        const data = await getSections(selectedClassId);
        setSections(data);
        form.setValue("sectionId", ""); // Reset section
      });
    } else {
      setSections([]);
    }
  }, [selectedClassId, form]);

  const onSubmit = (values: StudentFormValues) => {
    startTransition(async () => {
      const result = await createStudent(values);
      if (result.success) {
        toast.success("Student created successfully");
        setOpen(false);
        form.reset();
        router.refresh();
      } else {
        toast.error(result.message || "Failed to create student");
      }
    });
  };

  const StudentFormContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
        <div className={isMobile ? "px-0 space-y-6" : "px-5 space-y-6"}>
          {/* Personal Details Section */}
          <div className='space-y-4'>
            <h3 className='text-sm font-semibold text-muted-foreground border-b pb-2'>
              Personal Details
            </h3>
            <div
              className={
                isMobile
                  ? "grid grid-cols-1 gap-4"
                  : "grid grid-cols-1 md:grid-cols-2 gap-4"
              }
            >
              <CustomFormField
                control={form.control}
                name='fullName'
                label='Full Name'
                isRequired
                placeholder='Enter full name'
                fieldType={FormFieldType.INPUT}
              />

              <CustomFormField
                control={form.control}
                name='dob'
                label='Date of Birth'
                isRequired
                placeholder='Select date of birth'
                fieldType={FormFieldType.DATE_PICKER}
              />
            </div>

            <CustomFormField
              control={form.control}
              name='gender'
              label='Gender'
              isRequired
              placeholder='Select gender'
              fieldType={FormFieldType.RADIO_GROUP}
              options={[
                { value: "MALE", label: "Male" },
                { value: "FEMALE", label: "Female" },
                { value: "OTHER", label: "Other" },
              ]}
            />
          </div>

          {/* Academic Details */}
          <div className='space-y-4'>
            <h3 className='text-sm font-semibold text-muted-foreground border-b pb-2'>
              Academic Details
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <CustomFormField
                control={form.control}
                name='admissionNo'
                label='Admission No'
                isRequired
                placeholder='ADM-001'
                fieldType={FormFieldType.INPUT}
              />

              <CustomFormField
                control={form.control}
                name='rollNo'
                label='Roll No'
                isRequired
                placeholder='S-101'
                fieldType={FormFieldType.INPUT}
              />

              <CustomFormField
                control={form.control}
                name='admissionDate'
                label='Admission Date'
                isRequired
                placeholder='Select admission date'
                fieldType={FormFieldType.DATE_PICKER}
              />
            </div>
            <div className='grid grid-cols-2 gap-2'>
              <CustomFormField
                control={form.control}
                name='classId'
                label='Class'
                isRequired
                placeholder='Select class'
                fieldType={FormFieldType.SELECT}
                options={classes.map((cls) => ({
                  value: cls.id,
                  label: cls.name,
                }))}
              />

              <CustomFormField
                control={form.control}
                name='sectionId'
                label='Section'
                isRequired
                placeholder='Select section'
                fieldType={FormFieldType.SELECT}
                options={sections.map((sec) => ({
                  value: sec.id,
                  label: sec.name,
                }))}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className='space-y-4'>
            <h3 className='text-sm font-semibold text-muted-foreground border-b pb-2'>
              Contact Information
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <CustomFormField
                control={form.control}
                name='contactNo'
                label='Contact Number'
                isRequired
                placeholder='+1234567890'
                fieldType={FormFieldType.INPUT}
              />

              <CustomFormField
                control={form.control}
                name='email'
                label='Email'
                isRequired
                placeholder='Enter email'
                fieldType={FormFieldType.INPUT}
              />
            </div>
            <CustomFormField
              control={form.control}
              name='address'
              label='Address'
              isRequired
              placeholder='Enter address'
              fieldType={FormFieldType.TEXTAREA}
            />
          </div>

          {/* Guardian Details */}
          <div className='space-y-4'>
            <h3 className='text-sm font-semibold text-muted-foreground border-b pb-2'>
              Guardian Details
            </h3>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <CustomFormField
                control={form.control}
                name='fatherName'
                label="Father's Name"
                isRequired
                placeholder='Enter father name'
                fieldType={FormFieldType.INPUT}
              />

              <CustomFormField
                control={form.control}
                name='fatherContactNo'
                label="Father's Contact Number"
                isRequired
                placeholder='+1234567890'
                fieldType={FormFieldType.INPUT}
              />

              <CustomFormField
                control={form.control}
                name='motherName'
                label="Mother's Name"
                placeholder='Enter mother name'
                fieldType={FormFieldType.INPUT}
              />

              <CustomFormField
                control={form.control}
                name='motherContactNo'
                label="Mother's Contact Number"
                placeholder='+1234567890'
                fieldType={FormFieldType.INPUT}
              />

              <CustomFormField
                control={form.control}
                name='guardianName'
                label="Guardian's Name"
                placeholder='Enter guardian name'
                fieldType={FormFieldType.INPUT}
              />

              <CustomFormField
                control={form.control}
                name='guardianContactNo'
                label="Guardian's Contact Number"
                placeholder='+1234567890'
                fieldType={FormFieldType.INPUT}
              />
            </div>
          </div>
        </div>

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
                  "Create Student"
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
                "Create Student"
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
      </form>
    </Form>
  );

  // --- Render Logic: Desktop (Dialog) vs Mobile (Drawer) ---

  return (
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
              {StudentFormContent}
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog
          isOpen={open}
          onClose={() => setOpen(false)}
          position='center'
          title='Add New Student'
          size='xl'
        >
          {StudentFormContent}
        </Dialog>
      )}
    </>
  );
}
