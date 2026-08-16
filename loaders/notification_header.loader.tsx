"use client";

import { Skeleton } from "@/components/ui/skeleton";


const count = 4;
export default function NotificationsSkeleton() {
  return (
    
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="mx-1.5 my-1 p-2 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-40" />
            </div>
          </div>
          <Skeleton className="h-3 w-10 shrink-0" />
        </div>
      ))}
    </>
  );
}