"use client";

import { format } from "date-fns";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { BellOff } from "lucide-react";

type Reminder = {
  _id: string;
  note: string;
  reminder_at: string;
};

export default function UpcomingReminders({ data }: { data: Reminder[] }) {
  if (!data.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Reminders</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <BellOff className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No reminders found</p>
        </CardContent>
      </Card>
    );
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Reminders</CardTitle>
      </CardHeader>

      <CardContent className="space-y-0">
        {data.map((item, index) => {
          const isLast = index === data.length - 1;
          const date = new Date(item.reminder_at);

          return (
            <div key={item._id} className="flex gap-4">
              {/* time column */}
              <div className="w-16 shrink-0 text-right text-sm font-medium text-foreground pt-0.5">
                {format(date, "hh:mm a")}
              </div>

              {/* dot + connecting line */}
              <div className="flex flex-col items-center">
                <span className="h-3 w-3 shrink-0 rounded-full border-2 border-muted-foreground" />
                {!isLast && (
                  <span
                    className="w-px flex-1 bg-border"
                    style={{ minHeight: "2rem" }}
                  />
                )}
              </div>

              {/* note + date */}
              <div className={isLast ? "pb-0" : "pb-8"}>
                <p className="text-sm text-muted-foreground leading-snug">
                  {item.note}
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {format(date, "MMM d")}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>

      <CardFooter className="text-xs text-muted-foreground">
        {data.length} reminder{data.length > 1 ? "s" : ""}
      </CardFooter>
    </Card>
  );
}