"use client";
import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  BellOff,
  CalendarX,
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

function formatDateKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function groupRemindersByDate(data: Reminder[]) {
  const grouped: Record<string, Reminder[]> = {};
  for (const item of data) {
    const key = formatDateKey(new Date(item.reminder_at));
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(item);
  }
  return grouped;
}

export default function UpcomingReminders({ data }: { data: Reminder[] }) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    data[0] ? new Date(data[0].reminder_at) : new Date()
  );

  if (!data.length) {
    return (
      <div className="h-[400px] flex flex-col rounded-lg border border-border p-4">
        <h3 className="text-sm font-semibold">Upcoming Reminders</h3>
        <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
          <BellOff className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No reminders found</p>
        </div>
      </div>
    );
  }

  const remindersByDate = groupRemindersByDate(data);
  const selectedKey = selectedDate ? formatDateKey(selectedDate) : null;
  const selectedReminders = selectedKey ? remindersByDate[selectedKey] ?? [] : [];

  return (
    <div className="flex flex-col rounded-lg border border-border p-4">
      <h3 className="text-sm font-semibold mb-4">Upcoming Reminders</h3>

      <div className="flex flex-col md:flex-row gap-4">
        {/* Left side: Calendar */}
        <div className="md:w-auto shrink-0 flex justify-center md:border-r md:border-border md:pr-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            showOutsideDays={false}
            className="[--cell-size:--spacing(12)]"
            components={{
              DayButton: ({ children, modifiers, day, ...props }) => {
                const dayReminders = remindersByDate[formatDateKey(day.date)] ?? [];
                const hasReminder = dayReminders.length > 0;
                const dotColor =
                  hasReminder && isValidColor(dayReminders[0].status_color)
                    ? (dayReminders[0].status_color as string)
                    : "var(--chart-1)";

                return (
                  <CalendarDayButton day={day} modifiers={modifiers} {...props}>
                    <span className="text-xs font-medium leading-none">{children}</span>
                    {hasReminder && (
                      <span
                        className="h-1 w-1 rounded-full"
                        style={{ backgroundColor: dotColor }}
                      />
                    )}
                  </CalendarDayButton>
                );
              },
            }}
          />
        </div>

        {/* Right side: Reminders list */}
        <div className="flex-1 min-w-0 max-h-[420px] overflow-y-auto">
          {selectedReminders.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 text-center py-10">
              <CalendarX className="h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No reminders on this date
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {selectedReminders.map((item) => {
                const appliedDate = item.applied_on ? new Date(item.applied_on) : null;
                const visibleNotes = normalizeNotes(item.company_notes).slice(0, 5);
                const hasUrl = !!item.company_url;
                const jobTitle = resolveTitle(item);
                const hasStatus = !!item.status_name;
                const statusColor = isValidColor(item.status_color)
                  ? (item.status_color as string)
                  : "var(--chart-1)";

                return (
                  <div key={item._id} className="rounded-lg border border-border p-3">
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

                    {item.note && (
                      <div className="mt-4 rounded-md bg-background/60 border border-border/60 px-3 py-2">
                        <p className="text-sm text-foreground leading-snug">{item.note}</p>
                      </div>
                    )}

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
                        {format(new Date(item.reminder_at), "MMM d, hh:mm a")}
                      </span>
                      {appliedDate && (
                        <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 font-medium text-emerald-500">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Applied {format(appliedDate, "MMM d, yyyy")}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}