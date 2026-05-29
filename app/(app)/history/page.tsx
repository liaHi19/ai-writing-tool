import { Suspense } from "react";

import { HistoryList } from "@/components/history/HistoryList";
import { HistoryListSkeleton } from "@/components/history/HistoryListSkeleton";

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-(--bg) py-6">
      <div className="container max-w-6xl space-y-4">
        <Suspense fallback={<HistoryListSkeleton />}>
          <HistoryList />
        </Suspense>
      </div>
    </div>
  );
}
