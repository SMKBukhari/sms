"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { format } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarIcon,
  Loader2,
  Mail,
  User,
  Phone,
  MapPin,
  Users,
  UploadCloud,
  X,
  CheckCircle2,
  BookOpen,
  CreditCard,
  Shield,
  Sparkles,
  Camera,
} from "lucide-react";

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

import { createStudent, generateNextStudentIds } from "@/actions/student";
import { getClassFeeStructure } from "@/actions/fees";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { FormFieldType } from "@/lib/enums";
import CustomFormField from "@/components/global/CustomFormField";

// --- Zod Schema ---

const studentSchema = z.object({
  // Profile & Image
  imageURL: z.string().optional(),
  fullName: z.string().min(2, "Full Name is required"),
  dob: z.date(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),

  // Academic
  classId: z.string().min(1, "Class is required"),
  sectionId: z.string().min(1, "Section is required"),
  rollNo: z.string().min(1, "Roll No is required"),
  admissionNo: z.string().min(1, "Admission No is required"),
  admissionDate: z.date(),

  // Contact
  contactNo: z.string().min(10, "Valid contact number required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().min(5, "Address must be at least 5 chars"),

  // Guardian
  fatherName: z.string().min(2, "Father Name is required"),
  fatherContactNo: z.string().min(10, "Father Contact is required"),
  motherName: z.string().optional(),
  motherContactNo: z.string().optional(),
  guardianName: z.string().optional(),
  guardianRelation: z.string().optional(),
  guardianContactNo: z.string().optional(),

  // Fees
  feeOverrides: z.array(
    z.object({
      feeHeadId: z.string(),
      name: z.string(),
      defaultAmount: z.number(),
      amount: z.number().min(0, "Amount must be positive"),
    }),
  ),
});

type FormData = z.infer<typeof studentSchema>;

interface CreateStudentFormProps {
  classes: {
    id: string;
    name: string;
    sections: { id: string; name: string }[];
  }[];
}

// --- Components ---

const SectionHeader = ({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) => (
  <div className='flex items-start gap-4 mb-6'>
    <div className='p-3 rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20'>
      <Icon className='w-6 h-6' />
    </div>
    <div>
      <h3 className='text-xl font-bold tracking-tight'>{title}</h3>
      <p className='text-sm text-muted-foreground'>{description}</p>
    </div>
  </div>
);

export function CreateStudentForm({ classes }: CreateStudentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      status: "ACTIVE",
      admissionDate: new Date(),
      gender: "MALE",
      feeOverrides: [],
      // Initialize strings to empty to avoid uncontrolled inputs
      fullName: "",
      admissionNo: "",
      rollNo: "",
      address: "",
      contactNo: "",
      fatherName: "",
      fatherContactNo: "",
    },
    mode: "onChange",
  });

  const { setValue, watch, handleSubmit, control } = form;
  const selectedClassId = watch("classId");
  const feeOverrides = watch("feeOverrides");

  // --- Effects ---

  // Generate IDs on mount
  useEffect(() => {
    const fetchIds = async () => {
      try {
        const ids = await generateNextStudentIds();
        if (ids?.admissionNo) setValue("admissionNo", ids.admissionNo);
        if (ids?.rollNo) setValue("rollNo", ids.rollNo);
      } catch (error) {
        console.error("Failed to generate IDs", error);
      }
    };
    fetchIds();
  }, [setValue]);

  // Fetch Fees when Class changes
  useEffect(() => {
    const fetchFees = async () => {
      if (!selectedClassId) {
        setValue("feeOverrides", []);
        return;
      }
      try {
        const fees = await getClassFeeStructure(selectedClassId);
        const mappedFees = fees.map((f: any) => ({
          feeHeadId: f.feeHeadId,
          name: f.name,
          defaultAmount: f.amount,
          amount: f.amount,
        }));
        setValue("feeOverrides", mappedFees);
      } catch (error) {
        toast.error("Failed to load fee structure");
      }
    };
    fetchFees();
  }, [selectedClassId, setValue]);

  // --- Handlers ---

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setIsUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      setValue("imageURL", url);
      toast.success("Profile image uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload image");
      setImagePreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    startTransition(async () => {
      try {
        const realOverrides = data.feeOverrides.filter(
          (o) => o.amount !== o.defaultAmount,
        );

        const result = await createStudent({
          ...data,
          admissionDate: data.admissionDate.toISOString(),
          dob: data.dob.toISOString(),
          feeOverrides: realOverrides.map((o) => ({
            feeHeadId: o.feeHeadId,
            amount: o.amount,
          })),
          status: "ACTIVE",
          gender: "MALE",
        });

        if (result.success) {
          toast.success("Student created successfully!");
          router.push("/students");
          router.refresh();
        } else {
          toast.error(result.message || "Failed to create student");
        }
      } catch (error) {
        toast.error("An unexpected error occurred");
      }
    });
  };

  const totalFee =
    feeOverrides?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0;

  return (
    <div className='w-full mx-auto'>
      <div className='mb-8'>
        <motion.h1
          className='text-3xl font-bold tracking-tight '
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          New Student Admissions
        </motion.h1>
        <motion.p
          className='text-muted-foreground mt-2'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Complete the form below to register a new student. All fields marked
          with * are required.
        </motion.p>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-8'>
          {/* 1. Profile & Identity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className='shadow-lg bg-card hover:shadow-md transition-shadow duration-300 border-primary-border/60'>
              <CardContent>
                <SectionHeader
                  icon={Sparkles}
                  title='Student Profile'
                  description='Personal identity and system status'
                />

                <div className='flex flex-col md:flex-row gap-10'>
                  {/* Image Upload Zone */}
                  <div className='shrink-0'>
                    <FormLabel className='mb-3 block text-center font-medium'>
                      Profile Photo
                    </FormLabel>
                    <div className='relative group w-40 h-40 mx-auto md:mx-0'>
                      <div
                        className={cn(
                          "w-full h-full rounded-full border-2 border-dashed border-primary-border flex items-center justify-center overflow-hidden transition-all duration-300",
                          imagePreview
                            ? "border-primary"
                            : "border-primary-border hover:border-primary/50 hover:bg-background/20",
                        )}
                      >
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt='Preview'
                            className='w-full h-full object-cover'
                          />
                        ) : (
                          <div className='text-center p-4'>
                            <UploadCloud className='w-8 h-8 mx-auto text-muted-foreground mb-2' />
                            <p className='text-xs text-muted-foreground'>
                              Drag & drop or click
                            </p>
                          </div>
                        )}

                        {/* Overlay for uploading/hover */}
                        <label
                          className={cn(
                            "absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer transition-opacity duration-200",
                            imagePreview
                              ? "opacity-0 group-hover:opacity-100"
                              : "opacity-0",
                          )}
                        >
                          <div className='text-white text-xs font-medium flex flex-col items-center'>
                            <Camera className='w-6 h-6 mb-1' />
                            <span>Change Photo</span>
                          </div>
                          <input
                            type='file'
                            className='hidden'
                            accept='image/*'
                            onChange={handleImageUpload}
                            disabled={isUploading}
                          />
                        </label>

                        {/* Loading State */}
                        {isUploading && (
                          <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
                            <Loader2 className='w-8 h-8 text-white animate-spin' />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Profile Fields */}
                  <div className='flex-1 flex flex-col gap-6'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                      <div>
                        <CustomFormField
                          control={form.control}
                          name='fullName'
                          label='Full Name'
                          isRequired
                          placeholder='Enter full name'
                          fieldType={FormFieldType.INPUT}
                        />
                      </div>

                      <div>
                        <CustomFormField
                          control={form.control}
                          name='dob'
                          label='Date of Birth'
                          isRequired
                          placeholder='Enter date of birth'
                          fieldType={FormFieldType.DATE_PICKER}
                        />
                      </div>
                    </div>
                    <div>
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
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 2. Academic & Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className='grid grid-cols-1 md:grid-cols-2 gap-6'
          >
            <Card className='shadow-lg bg-card hover:shadow-md transition-shadow duration-300 border-primary-border/60'>
              <CardContent className='space-y-6'>
                <SectionHeader
                  icon={BookOpen}
                  title='Academic Information'
                  description='Class assignment and school records'
                />

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
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
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
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
                    options={classes
                      .find((cls) => cls.id === form.watch("classId"))
                      ?.sections.map((sec) => ({
                        value: sec.id,
                        label: sec.name,
                      }))}
                  />
                </div>
              </CardContent>
            </Card>
            <Card className='shadow-lg bg-card hover:shadow-md transition-shadow duration-300 border-primary-border/60'>
              <CardContent className='space-y-6'>
                <SectionHeader
                  icon={Shield}
                  title='Contact & Guardian'
                  description='Communication details and family information'
                />

                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
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
                    placeholder='Enter email'
                    fieldType={FormFieldType.INPUT}
                  />
                </div>
                <div className='w-full'>
                  <CustomFormField
                    control={form.control}
                    name='address'
                    label='Address'
                    isRequired
                    placeholder='Enter address'
                    fieldType={FormFieldType.TEXTAREA}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 3. Guardian Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className='shadow-lg bg-card hover:shadow-md transition-shadow duration-300 border-primary-border/60'>
              <CardContent className='space-y-6'>
                <SectionHeader
                  icon={Shield}
                  title='Guardian Information'
                  description='Guardian details and family information'
                />

                <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
                  {/* Right: Guardian Contact */}
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

                  <div className='flex gap-6'>
                    <CustomFormField
                      control={form.control}
                      name='guardianRelation'
                      label="Guardian's Relation"
                      placeholder='Guardian relation'
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
              </CardContent>
            </Card>
          </motion.div>

          {/* 4. Fees */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className='shadow-lg bg-card hover:shadow-md transition-shadow duration-300 border-primary-border/60'>
              <CardContent className='space-y-6'>
                <div className='flex justify-between items-start mb-6'>
                  <SectionHeader
                    icon={CreditCard}
                    title='Fee Structure'
                    description='Monthly tuition and other charges'
                  />
                  {feeOverrides.length > 0 && (
                    <div className='text-right'>
                      <p className='text-sm text-muted-foreground'>
                        Total Monthly Fee
                      </p>
                      <p className='text-2xl font-bold text-primary'>
                        ${totalFee.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>

                {!selectedClassId ? (
                  <div className='flex flex-col items-center justify-center h-40 border-2 border-dashed border-primary-border rounded-xl bg-background/20'>
                    <p className='text-muted-foreground'>
                      Please select a Class above to load fee structure
                    </p>
                  </div>
                ) : feeOverrides.length === 0 ? (
                  <div className='flex flex-col items-center justify-center h-40 border-2 border-dashed border-primary-border rounded-xl bg-background/20'>
                    <p className='text-muted-foreground'>
                      No fee structure defined for this class
                    </p>
                  </div>
                ) : (
                  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {feeOverrides.map((fee, index) => (
                      <div
                        key={fee.feeHeadId}
                        className='flex items-center gap-3 p-4 rounded-lg border border-primary-border shadow-sm'
                      >
                        <div className='flex-1 overflow-hidden'>
                          <p
                            className='font-semibold truncate'
                            title={fee.name}
                          >
                            {fee.name}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            Default: ${fee.defaultAmount}
                          </p>
                        </div>
                        <FormField
                          control={control}
                          name={`feeOverrides.${index}.amount`}
                          render={({ field }) => (
                            <FormItem className='space-y-0 w-24'>
                              <FormControl>
                                <Input
                                  type='number'
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  className={cn(
                                    "h-9 text-right font-mono input",
                                    field.value !== fee.defaultAmount &&
                                      "border-amber-400 bg-amber-50/10 text-amber-600",
                                  )}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Submit Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className='flex justify-end pt-8'
          >
            <Button
              type='submit'
              size='lg'
              className='px-10 h-12 text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all'
              disabled={isPending}
            >
              {isPending ? (
                <>
                  {" "}
                  <Loader2 className='w-5 h-5 mr-2 animate-spin' /> Creating
                  Profile...{" "}
                </>
              ) : (
                <>
                  {" "}
                  <CheckCircle2 className='w-5 h-5 mr-2' /> Create Student
                  Profile{" "}
                </>
              )}
            </Button>
          </motion.div>
        </form>
      </Form>
    </div>
  );
}
