"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

export default function GeneralSettings() {
  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium'>School Profile</h3>
        <p className='text-sm text-muted-foreground'>
          Manage your school's public profile and branding.
        </p>
      </div>
      <Separator />
      <div className='grid gap-8'>
        <div className='grid gap-4 max-w-xl'>
          <div className='grid gap-2'>
            <Label htmlFor='schoolName'>School Name</Label>
            <Input id='schoolName' defaultValue='Acme High School' />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='address'>Address</Label>
            <Textarea
              id='address'
              defaultValue='123 Education Lane, Knowledge City'
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='email'>Public Email</Label>
            <Input id='email' defaultValue='contact@acme.edu' />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='phone'>Phone</Label>
            <Input id='phone' defaultValue='+1 (555) 000-0000' />
          </div>
          <Button disabled>Save Changes (Demo)</Button>
        </div>
      </div>
    </div>
  );
}
