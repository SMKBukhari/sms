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

// Client Component Wrapper or make this page server and pass props to client form?
// Let's make a Client Form component to handle the dynamic section logic (which depends on class)
import { CreateStudentForm } from "./_components/CreateStudentForm";

export default async function CreateStudentPage() {
  const classes = await getClasses();

  return (
    <div className='max-w-2xl mx-auto py-8'>
      <h1 className='text-3xl font-bold mb-8'>Add New Student</h1>
      <CreateStudentForm classes={classes} />
    </div>
  );
}
