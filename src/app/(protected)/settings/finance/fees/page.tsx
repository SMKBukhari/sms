import { getClasses } from "@/actions/settings/academic";
import { getFeeHeads, getFeeStructures } from "@/actions/settings/finance";
import FeeManager from "@/components/settings/finance/fee-manager";

export default async function FeesPage() {
  const [heads, structures, classes] = await Promise.all([
    getFeeHeads(),
    getFeeStructures(),
    getClasses(),
  ]);

  return (
    <FeeManager feeHeads={heads} feeStructures={structures} classes={classes} />
  );
}
