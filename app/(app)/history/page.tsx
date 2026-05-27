import { Suspense } from "react";

import { HistoryList } from "@/components/history/HistoryList";
import { HistoryListSkeleton } from "@/components/history/HistoryListSkeleton";

export default function HistoryPage() {
  return (
    <div className="bg-zinc-50 p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">History</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Your past AI generations, newest first.
          </p>
        </div>

        <Suspense fallback={<HistoryListSkeleton />}>
          <HistoryList />
        </Suspense>
      </div>
    </div>
  );
}
