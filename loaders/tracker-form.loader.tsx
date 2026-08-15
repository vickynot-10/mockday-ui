
import { Skeleton } from "@/components/ui/skeleton";

export default function TrackerFormSkeleton() {
  return (
    <div className="flex flex-col mt-4 h-[calc(100vh-140px)]">
      {/* Tabs bar */}
      <div className="flex w-full border-b border-border gap-6 pb-3 shrink-0">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-5 w-36" />
      </div>

      {/* Form fields */}
      <div className="flex-1 min-h-0 overflow-y-auto mt-4">
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-40 w-full rounded-md" />
          </div>
        </div>
      </div>

      {/* Footer buttons */}
      <div className="flex justify-end shrink-0 gap-3 pt-4 border-t border-border mt-4">
        <Skeleton className="h-[46px] w-44 rounded-xl" />
        <Skeleton className="h-[46px] w-44 rounded-xl" />
      </div>
    </div>
  );
}