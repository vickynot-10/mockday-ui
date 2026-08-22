"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import {
  BellOff,
  ExternalLink,
  Building2,
  Clock3,
  CheckCircle2,
  StickyNote,
} from "lucide-react";

type Reminder = {
  _id: string;
  note: string;
  reminder_at: string;
  company: string;
  company_notes?: string[] | string;
  company_url?: string;
  company_img?: string;
  applied_on?: string;
  title?: string;
  page_title?: string;
  status_name?: string | null;
  status_color?: string | null;
};

function normalizeNotes(notes: string[] | string | undefined) {
  if (!notes) return [];
  if (Array.isArray(notes)) return notes.filter(Boolean);
  return notes
    .split("\n")
    .map((n) => n.trim())
    .filter(Boolean);
}

function resolveTitle(item: Reminder) {
  return item.title || item.page_title || "NA";
}

function isValidColor(color?: string | null) {
  return (
    typeof color === "string" &&
    /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(color)
  );
}

export default function UpcomingReminders({ data }: { data: Reminder[] }) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  if (!data.length) {
    return (
      <Card className="h-[400px] flex flex-col">
        <CardHeader>
          <CardTitle>Upcoming Reminders</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
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

      <CardContent className="flex flex-1 flex-col justify-center">
        <Carousel setApi={setApi} className="w-full">
          <CarouselContent>
            {data.map((item) => {
              const reminderDate = new Date(item.reminder_at);
              const appliedDate = item.applied_on ? new Date(item.applied_on) : null;
              const visibleNotes = normalizeNotes(item.company_notes).slice(0, 5);
              const hasUrl = !!item.company_url;
              const jobTitle = resolveTitle(item);
              const hasStatus = !!item.status_name;
              const statusColor = isValidColor(item.status_color)
                ? (item.status_color as string)
                : "var(--chart-1)";

              return (
                <CarouselItem key={item._id}>
                  <div className="rounded-lg border border-border bg-muted/30 p-5">
                    <div className="flex gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-primary/30 bg-primary/10">
                        {item.company_img ? (
                          <img
                            src={item.company_img}
                            alt={item.company}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Building2 className="h-6 w-6 text-primary" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-base font-bold text-foreground truncate">
                              {item.company}
                            </p>
                            <p
                              className={cn(
                                "text-xs mt-0.5 truncate",
                                jobTitle === "NA"
                                  ? "text-muted-foreground/60 italic"
                                  : "text-muted-foreground font-medium"
                              )}
                            >
                              {jobTitle}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {hasStatus && (
                              <span
                                className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
                                style={{
                                  backgroundColor: `${statusColor}1A`,
                                  color: statusColor,
                                }}
                              >
                                <span
                                  className="h-1.5 w-1.5 rounded-full"
                                  style={{ backgroundColor: statusColor }}
                                />
                                {item.status_name}
                              </span>
                            )}

                            {hasUrl && (
                              <Link href={item.company_url as string} target="_blank">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-primary"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 rounded-md bg-background/60 border border-border/60 px-3 py-2">
                      <p className="text-sm text-foreground leading-snug">
                        {item.note}
                      </p>
                    </div>

                    {visibleNotes.length > 0 && (
                      <div className="mt-3 rounded-md border border-border/60 px-3 py-2">
                        <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1.5">
                          <StickyNote className="h-3.5 w-3.5" />
                          Notes
                        </p>
                        <ul className="space-y-1">
                          {visibleNotes.map((note, i) => (
                            <li
                              key={i}
                              className="text-xs text-muted-foreground leading-snug pl-3 relative before:absolute before:left-0 before:content-['•']"
                            >
                              {note}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                      <span className="flex items-center gap-1.5 rounded-full bg-orange-500/10 px-2.5 py-1 font-medium text-orange-500">
                        <Clock3 className="h-3.5 w-3.5" />
                        {format(reminderDate, "MMM d, hh:mm a")}
                      </span>
                      {appliedDate && (
                        <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 font-medium text-emerald-500">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Applied {format(appliedDate, "MMM d, yyyy")}
                        </span>
                      )}
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <CarouselPrevious className="cursor-pointer" />
          <CarouselNext className="cursor-pointer" />
        </Carousel>

        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: count }).map((_, index) => (
            <button
              key={index}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300 cursor-pointer",
                {
                  "bg-primary w-6": index + 1 === current,
                  "bg-muted-foreground/30 w-2 hover:bg-muted-foreground/50":
                    index + 1 !== current,
                }
              )}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}