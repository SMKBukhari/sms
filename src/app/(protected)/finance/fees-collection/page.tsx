import {
  getFeeList,
  getFeeStats,
  getClassesForFilter,
} from "@/actions/fee-analytics";
import { FeesCollectionClient } from "./_components/fee-client";

export default async function FeesCollectionPage() {
  const [stats, { fees }, classes] = await Promise.all([
    getFeeStats(),
    getFeeList({ page: 1, pageSize: 50 }), // Load initial batch
    getClassesForFilter(),
  ]);

  return (
    <div className='space-y-8'>
      <FeesCollectionClient
        initialFees={fees}
        classes={classes}
        stats={stats}
      />
    </div>
  );
}
