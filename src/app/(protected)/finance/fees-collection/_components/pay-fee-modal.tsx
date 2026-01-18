"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { payFee } from "@/actions/fee-actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/formatters";

interface PayFeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fee: any; // Using any for speed, ideally proper type
  onSuccess: () => void;
}

export function PayFeeModal({
  open,
  onOpenChange,
  fee,
  onSuccess,
}: PayFeeModalProps) {
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  if (!fee) return null;

  const remaining = fee.amount - fee.paidAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || amount > remaining) {
      toast.error("Invalid amount");
      return;
    }

    setLoading(true);
    try {
      const res = await payFee(fee.id, amount);
      if (res.success) {
        toast.success("Payment recorded successfully");
        onSuccess();
        onOpenChange(false);
      } else {
        toast.error(res.message || "Payment failed");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>Make Payment</DialogTitle>
          <DialogDescription>
            {fee.student.fullName} - {fee.feeHead.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='grid gap-4 py-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='flex flex-col gap-1'>
              <span className='text-xs text-muted-foreground'>Total Fee</span>
              <span className='font-medium'>{formatCurrency(fee.amount)}</span>
            </div>
            <div className='flex flex-col gap-1'>
              <span className='text-xs text-muted-foreground'>Remaining</span>
              <span className='font-medium text-destructive'>
                {formatCurrency(remaining)}
              </span>
            </div>
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='amount'>Payment Amount</Label>
            <Input
              id='amount'
              type='number'
              value={amount}
              onChange={(e) => setAmount(parseFloat(e.target.value))}
              max={remaining}
              min={1}
              step='0.01'
              required
            />
          </div>

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={loading}>
              {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Confirm Payment
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
