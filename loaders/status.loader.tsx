"use client";

import { Skeleton } from "@/components/ui/skeleton";

type StatusGridSkeletonProps = {
  count?: number;
};

export default function StatusGridSkeleton({ count = 6 }: StatusGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="relative flex items-center gap-3 rounded-xl border border-border bg-card p-3 overflow-hidden"
        >
          <Skeleton className="w-8 h-8 rounded-lg shrink-0 ml-1" />

          <div className="flex-1 min-w-0 flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3 w-14" />
          </div>

          <div className="flex items-center gap-1">
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-5 rounded-full" />
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}