"use client";

import { updateSystemSettings } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTransition } from "react";

export function SystemSettings({
  settings,
}: {
  settings: Record<string, string>;
}) {
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      try {
        await updateSystemSettings(formData);
        toast.success("Settings updated");
      } catch (e) {
        toast.error("Failed to update settings");
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>School Information</CardTitle>
        <CardDescription>Configure global system settings.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className='space-y-4'>
          <div className='grid gap-4 md:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='schoolName'>School Name</Label>
              <Input
                id='schoolName'
                name='schoolName'
                defaultValue={settings.schoolName || ""}
                placeholder='Schola High School'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='academicYear'>Current Academic Year</Label>
              <Input
                id='academicYear'
                name='academicYear'
                defaultValue={settings.academicYear || "2024-2025"}
                placeholder='2024-2025'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='currency'>Currency Symbol</Label>
              <Input
                id='currency'
                name='currency'
                defaultValue={settings.currency || "$"}
                placeholder='$'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='address'>School Address</Label>
              <Input
                id='address'
                name='address'
                defaultValue={settings.address || ""}
                placeholder='123 Education Lane'
              />
            </div>
          </div>
          <div className='pt-4'>
            <Button type='submit' disabled={isPending}>
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
