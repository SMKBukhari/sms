"use client";

import { useState, useTransition } from "react";
import { collectFee } from "@/actions/finance";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

// For brevity, using simple select. Ideally Combobox for large list.
interface StudentOption {
  id: string;
  fullName: string;
  admissionNo: string;
}

export function CollectFeeDialog({ students }: { students: StudentOption[] }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        await collectFee(formData);
        toast.success("Fee collected successfully");
        setOpen(false);
      } catch (error) {
        toast.error("Failed to collect fee");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          Collect Fee
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Collect Fee</DialogTitle>
          <DialogDescription>
            Record a fee payment from a student.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='student' className='text-right'>
              Student
            </Label>
            <Select name='studentId' required>
              <SelectTrigger className='col-span-3'>
                <SelectValue placeholder='Select student' />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.fullName} ({s.admissionNo})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='amount' className='text-right'>
              Amount
            </Label>
            <Input
              id='amount'
              name='amount'
              type='number'
              step='0.01'
              required
              className='col-span-3'
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='description' className='text-right'>
              Note
            </Label>
            <Input
              id='description'
              name='description'
              placeholder='Tuition Fee Jan'
              className='col-span-3'
            />
          </div>
          <DialogFooter>
            <Button type='submit' disabled={isPending}>
              {isPending ? "Saving..." : "Save Transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
