"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function JobTrackerKanbanSkeleton() {
  const columnCount = 4;
  const cardCounts = [3, 4, 2, 3];

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {Array.from({ length: columnCount }).map((_, colIndex) => (
        <div key={colIndex} className="flex flex-col w-80 shrink-0">
          <div className="flex items-center gap-2 mb-3 px-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>

          <div className="flex flex-col gap-2.5">
            {Array.from({ length: cardCounts[colIndex] }).map((_, cardIndex) => (
              <div
                key={cardIndex}
                className="rounded-xl border bg-card p-3.5 flex items-center gap-3"
              >
                <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                  <Skeleton className="h-3 w-2/5" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="size-9 rounded-full shrink-0" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}