"use client";

import { useTransition, useState } from "react";
import { registerAdmin } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    startTransition(async () => {
      try {
        await registerAdmin(formData);
        toast.success("Admin registered successfully");
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
    <div className='w-full max-w-md space-y-8'>
      <div className='text-center'>
        <h2 className='text-2xl font-bold tracking-tight text-foreground'>
          Create Your Account
        </h2>
        <p className='mt-2 text-sm text-muted-foreground'>
          Join Schola today and get started with smarter school management
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='space-y-2'>
          <Label htmlFor='username'>Username</Label>
          <Input
            id='username'
            name='username'
            type='text'
            placeholder='Enter your username'
            required
            disabled={isPending}
            className='h-11'
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='adminCode'>Admin Code</Label>
          <Input
            id='adminCode'
            name='adminCode'
            type='password'
            placeholder='Enter admin secret code'
            required
            disabled={isPending}
            className='h-11'
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='password'>Password</Label>
          <div className='relative'>
            <Input
              id='password'
              name='password'
              type={showPassword ? "text" : "password"}
              placeholder='Create a secure password'
              required
              disabled={isPending}
              className='h-11 pr-10'
            />
            <button
              type='button'
              onClick={() => setShowPassword(!showPassword)}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
            >
              {showPassword ? (
                <EyeOff className='h-4 w-4' />
              ) : (
                <Eye className='h-4 w-4' />
              )}
            </button>
          </div>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='confirmPassword'>Confirm Password</Label>
          <div className='relative'>
            <Input
              id='confirmPassword'
              name='confirmPassword'
              type={showConfirmPassword ? "text" : "password"}
              placeholder='Re-enter your password'
              required
              disabled={isPending}
              className='h-11 pr-10'
            />
            <button
              type='button'
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
            >
              {showConfirmPassword ? (
                <EyeOff className='h-4 w-4' />
              ) : (
                <Eye className='h-4 w-4' />
              )}
            </button>
          </div>
        </div>

        <div className='flex items-center space-x-2'>
          <Checkbox id='terms' required disabled={isPending} />
          <Label
            htmlFor='terms'
            className='text-sm font-normal text-muted-foreground'
          >
            I agree to the{" "}
            <Link href='/terms' className='text-primary hover:underline'>
              Terms & Conditions
            </Link>
          </Label>
        </div>

        <Button
          type='submit'
          className='w-full h-11 text-base'
          disabled={isPending}
        >
          {isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
          Register
        </Button>
      </form>

      <div className='text-center text-sm text-muted-foreground'>
        Already have an account?{" "}
        <Link
          href='/login'
          className='font-semibold text-primary hover:underline'
        >
          Login Here
        </Link>
      </div>
    </div>
  );
}
