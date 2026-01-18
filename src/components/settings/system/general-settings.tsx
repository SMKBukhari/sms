"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getSystemSettings, updateSystemSettings } from "@/actions/settings";

export default function GeneralSettings() {
  const [isPending, startTransition] = useTransition();
  const [admissionPrefix, setAdmissionPrefix] = useState("ADM-"); // Default fallback
  const [rollPrefix, setRollPrefix] = useState("S-"); // Default fallback
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    startTransition(async () => {
      const settings = await getSystemSettings([
        "student_admission_prefix",
        "student_roll_prefix",
      ]);
      if (settings["student_admission_prefix"])
        setAdmissionPrefix(settings["student_admission_prefix"]);
      if (settings["student_roll_prefix"])
        setRollPrefix(settings["student_roll_prefix"]);
      setLoading(false);
    });
  }, []);

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateSystemSettings({
        student_admission_prefix: admissionPrefix,
        student_roll_prefix: rollPrefix,
      });

      if (result.success) {
        toast.success("Settings updated successfully");
      } else {
        toast.error("Failed to update settings");
      }
    });
  };

  return (
    <div className='space-y-6'>
      <div>
        <h3 className='text-lg font-medium'>School Profile</h3>
        <p className='text-sm text-muted-foreground'>
          Manage your school's public profile and branding.
        </p>
      </div>
      <Separator />

      {/* Existing School Profile Form (Mock) */}
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
          <Button disabled variant='outline'>
            Save Profile (Demo)
          </Button>
        </div>
      </div>

      <Separator />

      {/* Student ID Configuration */}
      <div>
        <h3 className='text-lg font-medium'>Student ID Configuration</h3>
        <p className='text-sm text-muted-foreground'>
          Set custom prefixes for auto-generated Admission and Roll numbers.
        </p>
      </div>
      <div className='grid gap-8'>
        <div className='grid gap-4 max-w-xl'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='grid gap-2'>
              <Label htmlFor='admissionPrefix'>Admission No Prefix</Label>
              <Input
                id='admissionPrefix'
                value={admissionPrefix}
                onChange={(e) => setAdmissionPrefix(e.target.value)}
                placeholder='e.g. ADM-'
                disabled={loading}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='rollPrefix'>Roll No Prefix</Label>
              <Input
                id='rollPrefix'
                value={rollPrefix}
                onChange={(e) => setRollPrefix(e.target.value)}
                placeholder='e.g. S-'
                disabled={loading}
              />
            </div>
          </div>
          <Button onClick={handleSave} disabled={isPending || loading}>
            {isPending ? (
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            ) : null}
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
}
