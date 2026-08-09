
export default function AutoFillSkeleton() {
  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="h-5 w-32 rounded bg-muted animate-pulse mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="h-4 w-16 rounded bg-muted animate-pulse" />
              <div className="h-10 rounded-md bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-24 rounded bg-muted animate-pulse" />
          <div className="h-8 w-24 rounded-md bg-muted animate-pulse" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3"
            >
              <div className="h-10 rounded-md bg-muted animate-pulse" />
              <div className="h-10 rounded-md bg-muted animate-pulse" />
              <div className="h-10 w-20 rounded-md bg-muted animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}