"use client";

import { useTransition, useState } from "react";
import { loginUser } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      try {
        await loginUser(formData);
        toast.success("Logged in successfully");
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Invalid credentials");
        }
      }
    });
  }

  return (
    <div className='w-full max-w-md space-y-8'>
      <div className='text-center'>
        <div className='flex justify-center mb-6'>
          <div className='h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-2xl'>
            S
          </div>
        </div>
        <h2 className='text-2xl font-bold tracking-tight text-foreground'>
          Login to Your Account
        </h2>
        <p className='mt-2 text-sm text-muted-foreground'>
          Access your dashboard and continue where you left off
        </p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='space-y-2'>
          <Label htmlFor='username'>Username or Email Address</Label>
          <Input
            id='username'
            name='username'
            type='text'
            placeholder='yourname@example.com'
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
              placeholder='Enter your password'
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

        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-2'>
            <Checkbox id='remember' disabled={isPending} />
            <Label
              htmlFor='remember'
              className='text-sm font-normal text-muted-foreground'
            >
              Remember Me
            </Label>
          </div>
          <Link
            href='/forgot-password'
            className='text-sm font-medium text-primary hover:underline'
          >
            Forgot Password?
          </Link>
        </div>

        <Button
          type='submit'
          className='w-full h-11 text-base'
          disabled={isPending}
        >
          {isPending ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
          Login
        </Button>
      </form>

      <div className='text-center text-sm text-muted-foreground'>
        New to Schola?{" "}
        <Link
          href='/register/admin'
          className='font-semibold text-primary hover:underline'
        >
          Create account
        </Link>
      </div>
    </div>
  );
}
