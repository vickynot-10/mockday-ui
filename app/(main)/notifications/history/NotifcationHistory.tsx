"use client";
import { useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { Mail, Smartphone, Layers,} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useGetNotificationsLogs } from "@/hooks/queries/useNotiications";
import AppliedDateFilter from "@/components/common/DatePicker";
import NotificationLogsSkeleton from "@/loaders/notification.loader";
import Image from "next/image";

const NOTIFICATION_LOG_TYPE = {
  ALL: 0,
  EMAIL: 1,
  PUSH: 2,
} as const;

const TYPE_FILTERS = [
  { id: "all", label: "All", value: NOTIFICATION_LOG_TYPE.ALL, icon: Layers },
  {
    id: "email",
    label: "Email",
    value: NOTIFICATION_LOG_TYPE.EMAIL,
    icon: Mail,
  },
  {
    id: "push",
    label: "Push",
    value: NOTIFICATION_LOG_TYPE.PUSH,
    icon: Smartphone,
  },
];

const TYPE_STYLES: Record<
  number,
  { icon: typeof Mail; iconColor: string; bgColor: string }
> = {
  [NOTIFICATION_LOG_TYPE.EMAIL]: {
    icon: Mail,
    iconColor: "stroke-blue-400",
    bgColor: "bg-blue-400/10",
  },
  [NOTIFICATION_LOG_TYPE.PUSH]: {
    icon: Smartphone,
    iconColor: "stroke-violet-400",
    bgColor: "bg-violet-400/10",
  },
};

function toApiDate(date: Date, endOfDay = false) {
  const d = new Date(date);
  if (endOfDay) d.setHours(23, 59, 59, 999);
  else d.setHours(0, 0, 0, 0);
  return d.toISOString().replace("Z", "+00:00");
}

export default function NotificationsHistory() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [activeType, setActiveType] = useState("all");

  const selectedType = TYPE_FILTERS.find((t) => t.id === activeType)?.value;

  const filters = useMemo(
    () => ({
      from: dateRange?.from ? toApiDate(dateRange.from) : undefined,
      to: dateRange?.to ? toApiDate(dateRange.to, true) : undefined,
      type: selectedType,
    }),
    [dateRange, selectedType],
  );

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useGetNotificationsLogs(filters);

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage) fetchNextPage();
  }, [inView, hasNextPage, fetchNextPage]);

  const items = data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ButtonGroup>
          {TYPE_FILTERS.map((filter) => {
            const isActive = activeType === filter.id;
            const Icon = filter.icon;
            return (
              <Button
                key={filter.id}
                variant="outline"
                size="sm"
                onClick={() => setActiveType(filter.id)}
                className={cn(
                  "relative overflow-hidden cursor-pointer gap-1.5",
                  isActive
                    ? "text-primary-foreground hover:text-primary-foreground border-transparent"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="active-type-bg"
                    className="absolute inset-0 bg-primary"
                    transition={{ type: "spring", stiffness: 350, damping: 28 }}
                    style={{ borderRadius: "inherit" }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className="h-3.5 w-3.5" />
                  {filter.label}
                </span>
              </Button>
            );
          })}
        </ButtonGroup>

        <AppliedDateFilter value={dateRange} onApply={setDateRange} />
      </div>

      {isLoading && <NotificationLogsSkeleton count={6} />}

      {!isLoading && items.length === 0 && (
          <div className="flex flex-col items-center justify-center w-full gap-2">
              <Image
                src="/icons/no_notifications.svg"
                alt="No Data Found"
                height={400}
                width={400}
              />
              <p className="text-base   font-bold text-muted-foreground"> Try Adjusting Filters ! </p>
            </div>
      )}

      {!isLoading && items.length > 0 && (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {items &&
              items.length > 0 &&
              items.map((item: any, index: number) => {
                const style = TYPE_STYLES[item.status ?? 1];
                const Icon = style.icon;
                return (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.2,
                      delay: Math.min(index, 8) * 0.02,
                    }}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                          style.bgColor,
                        )}
                      >
                        <Icon
                          size={18}
                          strokeWidth={2}
                          className={style.iconColor}
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">
                          {item.msg}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {item.notes}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(item.fired_at), "MMM dd, yyyy")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(item.fired_at), "hh:mm a")}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </div>
      )}

      <div ref={ref} className="h-1" />
      {isFetchingNextPage && <NotificationLogsSkeleton count={3} />}
    </div>
  );
}
