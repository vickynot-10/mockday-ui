"use client";
import Tooltip from "@/components/common/ToolTip";
import Link from "next/link";
import { format } from "date-fns";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BellOff, Eye, ExternalLink } from "lucide-react";

type Reminder = {
  _id: string;
  note: string;
  reminder_at: string;
  company: string;
  company_notes: string[];
  company_url?: string;
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
    <Card className="h-[400px] flex flex-col">
      <CardHeader>
        <CardTitle>Upcoming Reminders</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto thin-scrollbar space-y-0">
        {data.map((item, index) => {
          const isLast = index === data.length - 1;
          const date = new Date(item.reminder_at);
          const notes = item.company_notes ?? [];
          const visibleNotes = notes.slice(0, 5);
          const hasUrl = !!item.company_url;
          return (
            <div key={item._id} className="flex overflow-y-auto gap-4">
              <div className="w-16 shrink-0 text-right text-sm font-medium text-foreground pt-0.5">
                {format(date, "hh:mm a")}
              </div>

              <div className="flex flex-col items-center">
                <span className="h-3 w-3 shrink-0 rounded-full border-2 border-muted-foreground" />
                {!isLast && (
                  <span
                    className="w-px flex-1 bg-border"
                    style={{ minHeight: "2rem" }}
                  />
                )}
              </div>

              <div className={isLast ? "pb-0 flex-1" : "pb-8 flex-1"}>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-primary">
                    {item.company}
                  </p>

                  <div className="flex items-center gap-1">
                    {notes.length > 0 && (
                      <Tooltip
                        content={
                          <div className="flex flex-col gap-1 text-xs">
                            {visibleNotes.map((note, i) => (
                              <span key={i}>• {note}</span>
                            ))}
                          </div>
                        }
                      >
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </Tooltip>
                    )}

                    {hasUrl && (
                      <Link href={item.company_url as string} target="_blank">
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-snug mt-0.5">
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
