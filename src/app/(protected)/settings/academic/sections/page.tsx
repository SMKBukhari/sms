import { getClasses, getSections } from "@/actions/settings/academic";
import SectionManager from "@/components/settings/academic/section-manager";

export default async function SectionsPage() {
  const [sections, classes] = await Promise.all([getSections(), getClasses()]);
  return <SectionManager initialSections={sections} classes={classes} />;
}
