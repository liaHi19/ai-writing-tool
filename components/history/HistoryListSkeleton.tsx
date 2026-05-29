export function HistoryListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="h-9 w-full max-w-xs animate-pulse rounded-(--radius) border bg-(--surface)" />
        <div className="flex flex-1 flex-wrap gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-7 w-16 animate-pulse rounded-full border bg-(--surface)"
            />
          ))}
        </div>
        <div className="h-8 w-24 animate-pulse rounded-(--radius) border bg-(--surface)" />
      </div>

      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="min-h-55 animate-pulse rounded-(--radius) border bg-(--surface) p-4.5"
          />
        ))}
      </div>
    </div>
  );
}
