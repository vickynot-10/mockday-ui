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