import { getClasses } from "@/actions/settings/academic";
import ClassManager from "@/components/settings/academic/class-manager";

export default async function ClassesPage() {
  const classes = await getClasses();
  return <ClassManager initialClasses={classes} />;
}
