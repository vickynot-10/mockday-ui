import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ResumeCardSkeleton() {
  return (
    <Card className="h-full overflow-hidden">
      <CardContent className="px-0">
        <Skeleton className="w-full h-52 rounded-none" />
      </CardContent>

      <CardHeader className="flex flex-row items-start justify-between gap-2">
        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="w-4 h-4 rounded-sm shrink-0" />
      </CardHeader>

      <CardContent className="flex flex-col gap-3 p-4 pt-0">
        <CardFooter className="gap-3 p-0 max-sm:flex-col max-sm:items-stretch">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
        </CardFooter>
      </CardContent>
    </Card>
  );
}