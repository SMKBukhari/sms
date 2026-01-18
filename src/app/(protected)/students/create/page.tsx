import { createStudent } from "@/actions/createStudent";
import { getClasses } from "@/actions/academic";
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
import { Role, Gender } from "@/generated/prisma/enums";

import { CreateStudentForm } from "./_components/CreateStudentForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Student | SMS",
  description: "Create a new student to get started with SMS",
};

export default async function CreateStudentPage() {
  const classes = await getClasses();

  return (
    <div className=''>
      <CreateStudentForm classes={classes} />
    </div>
  );
}
