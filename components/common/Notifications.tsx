"use client";

import type { ReactElement } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useGetUserNotifications } from "@/hooks/queries/useNotiications";
import { NOTIFICATION_CONSTANTS } from "@/constants";
import { BellRing, CheckCircle2, XCircle, LucideIcon } from "lucide-react";
import NotificationsSkeleton from "@/loaders/notification_header.loader";
import Link from "next/link";

type Props = {
  trigger: ReactElement;
  defaultOpen?: boolean;
  align?: "start" | "center" | "end";
};

const STATUS_MAP: Record<
  number,
  { icon: LucideIcon; iconColor: string; bgColor: string }
> = {
  [NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.SUCCESS]: {
    icon: CheckCircle2,
    iconColor: "stroke-teal-400",
    bgColor: "bg-teal-400/10",
  },
  [NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.ERROR]: {
    icon: XCircle,
    iconColor: "stroke-red-500",
    bgColor: "bg-red-500/10",
  },
};

const formatTime = (isoString: string) =>
  new Date(isoString).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

const NotificationsDropdown = ({
  trigger,
  defaultOpen,
  align = "end",
}: Props) => {
  const { data, isLoading } = useGetUserNotifications();
  const notifications = data?.data ?? [];

  return (
    <div className="flex items-start justify-center">
      <DropdownMenu defaultOpen={defaultOpen}>
        <DropdownMenuTrigger>{trigger}</DropdownMenuTrigger>
        <DropdownMenuContent
          align={align}
          className="p-0 w-[calc(100vw-24px)] sm:w-sm rounded-2xl data-open:slide-in-from-top-20! data-closed:slide-out-to-top-20 data-open:fade-in-0 data-closed:fade-out-0 data-closed:zoom-out-100 duration-400"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex items-center justify-between p-4">
              <p className="text-base font-medium text-popover-foreground">
                Notifications
              </p>
              <Badge className="font-normal leading-0">
                {notifications.length} New
              </Badge>
            </DropdownMenuLabel>

            {isLoading && <NotificationsSkeleton />}

            {!isLoading && notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-3 px-4 py-8 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <BellRing className="h-6 w-6 text-muted-foreground" />
                </div>
                <Link href="/notifications-logs" className="text-sm text-muted-foreground">
                  No notifications
                </Link>
              </div>
            )}

            {!isLoading &&
              notifications &&
              notifications.length > 0 &&
              notifications.map((item: any) => {
                const config =
                  STATUS_MAP[item.status] ??
                  STATUS_MAP[NOTIFICATION_CONSTANTS.NOTIFICATION_TYPE.SUCCESS];
                const Icon = config.icon;
                return (
                  <DropdownMenuItem
                    key={item._id}
                    className="mx-1.5 my-1 p-2 flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2.5 rounded-xl", config.bgColor)}>
                        <Icon
                          size={20}
                          strokeWidth={2}
                          className={cn("size-5", config.iconColor)}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-popover-foreground">
                          {item.msg}
                        </p>
                        <p className="max-w-52 truncate text-sm text-muted-foreground">
                          {item.notes}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(item.fired_at)}
                    </p>
                  </DropdownMenuItem>
                );
              })}

            <div className="mx-1.5 my-1 p-2">
              <Button className="rounded-xl w-full cursor-pointer h-9 hover:bg-primary/80">
                See All Notifications
              </Button>
            </div>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default function NotificationsButton() {
  return (
    <NotificationsDropdown
      align="center"
      trigger={
        <Avatar className="size-9 cursor-pointer">
          <AvatarFallback>
            <BellRing className="size-4" strokeWidth={2} />
          </AvatarFallback>
        </Avatar>
      }
    />
  );
}
