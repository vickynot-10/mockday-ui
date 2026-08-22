import { Skeleton } from "@/components/ui/skeleton";

const DUMMY = [1, 2, 3, 4, 5, 6, 7, 8];

export function BarChartLoader() {
  return (
    <div className="flex h-[180px] items-end gap-2 px-2">
      {DUMMY.map((el) => (
        <Skeleton
          key={el}
          className="flex-1 rounded-md"
          style={{ height: `${30 + ((el * 37) % 70)}%` }}
        />
      ))}
    </div>
  );
}


export function LineChartLoader() {
  return (
    <div className="relative h-[180px] w-full overflow-hidden">
      <svg
        viewBox="0 0 400 140"
        className="absolute inset-0 h-full w-full animate-pulse"
        preserveAspectRatio="none"
      >
        <polyline
          points="0,110 40,90 80,100 120,60 160,80 200,40 240,70 280,30 320,55 360,20 400,45"
          fill="none"
          stroke="var(--muted-foreground)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.4"
        />
      </svg>

      <div className="absolute bottom-0 flex w-full items-end justify-between px-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-3 w-8 rounded" />
        ))}
      </div>
    </div>
  );
}