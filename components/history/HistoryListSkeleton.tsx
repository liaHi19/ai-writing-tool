export function HistoryListSkeleton() {
  return (
    <ul className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <li
          key={i}
          className="h-32 animate-pulse rounded-lg border bg-white p-4 shadow-sm"
        />
      ))}
    </ul>
  );
}
