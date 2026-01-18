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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  createFeeHead,
  createFeeStructure,
  deleteFeeHead,
  deleteFeeStructure,
} from "@/actions/settings/finance";
import EmptyState from "@/components/global/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// --- Form Schemas ---
const headSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

const structureSchema = z.object({
  classId: z.string().min(1, "Class is required"),
  feeHeadId: z.string().min(1, "Fee Head is required"),
  amount: z.number().min(0, "Amount must be positive"),
  dueDate: z.string().optional(),
});

interface FeeManagerProps {
  feeHeads: any[];
  feeStructures: any[];
  classes: any[];
}

export default function FeeManager({
  feeHeads,
  feeStructures,
  classes,
}: FeeManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [headOpen, setHeadOpen] = useState(false);
  const [structOpen, setStructOpen] = useState(false);

  const headForm = useForm<z.infer<typeof headSchema>>({
    resolver: zodResolver(headSchema),
    defaultValues: { name: "", description: "" },
  });

  const structForm = useForm<z.infer<typeof structureSchema>>({
    resolver: zodResolver(structureSchema),
    defaultValues: { classId: "", feeHeadId: "", amount: 0, dueDate: "" },
  });

  const onHeadSubmit = (values: z.infer<typeof headSchema>) => {
    startTransition(() => {
      createFeeHead(values.name, values.description).then((result) => {
        if (result.success) {
          toast.success(result.message);
          setHeadOpen(false);
          headForm.reset();
        } else {
          toast.error(result.message);
        }
      });
    });
  };

  const onStructSubmit = (values: z.infer<typeof structureSchema>) => {
    startTransition(() => {
      createFeeStructure(values).then((result) => {
        if (result.success) {
          toast.success(result.message);
          setStructOpen(false);
          structForm.reset();
        } else {
          toast.error(result.message);
        }
      });
    });
  };

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-xl font-bold tracking-tight'>Finance Settings</h2>
        <p className='text-sm text-muted-foreground'>
          Manage fee heads and class-wise fee structures.
        </p>
      </div>

      <Tabs defaultValue='structures' className='w-full'>
        <TabsList>
          <TabsTrigger value='structures'>Fee Structures</TabsTrigger>
          <TabsTrigger value='heads'>Fee Heads</TabsTrigger>
        </TabsList>

        <TabsContent value='structures' className='space-y-4 pt-4'>
          <div className='flex justify-end'>
            <Dialog open={structOpen} onOpenChange={setStructOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className='mr-2 h-4 w-4' /> Add Fee Structure
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Fee Structure</DialogTitle>
                </DialogHeader>
                <Form {...structForm}>
                  <form
                    onSubmit={structForm.handleSubmit(onStructSubmit)}
                    className='space-y-4'
                  >
                    <FormField
                      control={structForm.control}
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
                              {classes.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={structForm.control}
                      name='feeHeadId'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fee Head</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder='Select Head' />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {feeHeads.map((h) => (
                                <SelectItem key={h.id} value={h.id}>
                                  {h.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={structForm.control}
                      name='amount'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <Input
                              type='number'
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={structForm.control}
                      name='dueDate'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Due Date (e.g. 5th of Month)</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                        Save Structure
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          {feeStructures.length === 0 ? (
            <EmptyState
              title='No Fee Structures'
              description='Define fees for classes.'
              icon={<Plus />}
            />
          ) : (
            <div className='border rounded-lg'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Fee Head</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className='w-[70px]'></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feeStructures.map((fs) => (
                    <TableRow key={fs.id}>
                      <TableCell>{fs.class.name}</TableCell>
                      <TableCell>{fs.feeHead.name}</TableCell>
                      <TableCell className='font-mono'>
                        {fs.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>{fs.dueDate || "-"}</TableCell>
                      <TableCell>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8 text-red-600'
                          onClick={() => {
                            if (confirm("Delete this fee structure?")) {
                              startTransition(() => {
                                deleteFeeStructure(fs.id).then(() => {
                                  // toast or other feedback handled by revalidatePath usually,
                                  // but here checking result logic is good practice if added to deleteFeeStructure
                                });
                              });
                            }
                          }}
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
        </TabsContent>

        <TabsContent value='heads' className='space-y-4 pt-4'>
          <div className='flex justify-end'>
            <Dialog open={headOpen} onOpenChange={setHeadOpen}>
              <DialogTrigger asChild>
                <Button variant='outline'>
                  <Plus className='mr-2 h-4 w-4' /> Add Fee Head
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Fee Head</DialogTitle>
                </DialogHeader>
                <Form {...headForm}>
                  <form
                    onSubmit={headForm.handleSubmit(onHeadSubmit)}
                    className='space-y-4'
                  >
                    <FormField
                      control={headForm.control}
                      name='name'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder='e.g. Tuition Fee' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={headForm.control}
                      name='description'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input placeholder='Optional' {...field} />
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
                        Create Head
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {feeHeads.map((head) => (
              <Card key={head.id}>
                <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
                  <CardTitle className='text-sm font-medium'>
                    {head.name}
                  </CardTitle>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-6 w-6 text-red-600'
                    onClick={() => {
                      if (confirm("Delete this fee head?")) {
                        startTransition(() => {
                          deleteFeeHead(head.id);
                        });
                      }
                    }}
                  >
                    <Trash className='h-3 w-3' />
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className='text-xs text-muted-foreground'>
                    {head.description || "No description"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
