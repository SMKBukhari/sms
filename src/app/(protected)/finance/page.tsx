import { requireRole } from "@/lib/auth";
import { Role } from "@/generated/prisma/enums";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import FeesCollectionPage from "./fees-collection/page";

export default async function FinancePage() {
  await requireRole([Role.ADMIN]);

  return (
    <div className='flex flex-col gap-6'>
      <FeesCollectionPage />
    </div>
  );
}
