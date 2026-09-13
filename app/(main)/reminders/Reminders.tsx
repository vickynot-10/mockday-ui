"use client";
import { useMemo, useRef, useState } from "react";
import { format, parseISO, isSameMonth } from "date-fns";
import { motion } from "motion/react";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import useDebounce from "@/hooks/app/useDebounce";
import { useGetReminders } from "@/hooks/queries/useReminders";
import AppIconButton from "@/components/common/AppIconButton";
import AddReminder from "../job-tracker/components/AddReminder";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import AppVariantButton from "@/components/common/AppVariantButton";
import { Search, Clock, CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ReminderRow = {
  _id: string;
  date: string;
  note: string;
  reminder_at: string;
  time: string;
  image?: string | null;
  applied_on: string;
  title: string;
  status: string | null;
  status_color: string | null;
};

const DEFAULT_STATUS_COLOR = "#94a3b8";

function getCompanyName(reminder: ReminderRow) {
  if (!reminder.image) return "NA";
  try {
    const host = new URL(reminder.image).hostname.replace("www.", "");
    return host.split(".")[0].toUpperCase();
  } catch {
    return "NA";
  }
}

export default function Reminders() {
  const [search, setSearch] = useState("");
  const [visibleMonth, setVisibleMonth] = useState(new Date());
  const [flashKey, setFlashKey] = useState<string | null>(null);
  const [editTrackerId, setEditTrackerId] = useState<string | null>(null);
  const [openEdit, setOpenEdit] = useState(false);
  const [deleteTrackerId, setDeleteTrackerId] = useState<string | null>(null);
  const search_term = useDebounce(search, 500);
  const { data } = useGetReminders(search_term);

  const reminders: ReminderRow[] = data?.data?.docs ?? [];
  const groupRefs = useRef(new Map<string, HTMLDivElement>());

  function removeReminder() {}

  const remindersByDay = useMemo(() => {
    const map = new Map<string, ReminderRow[]>();
    reminders.forEach((reminder) => {
      const key = format(parseISO(reminder.date), "yyyy-MM-dd");
      const existing = map.get(key) ?? [];
      existing.push(reminder);
      map.set(key, existing);
    });
    return map;
  }, [reminders]);

  const groupedList = useMemo(() => {
    return Array.from(remindersByDay.entries()).sort(([a], [b]) =>
      a.localeCompare(b),
    );
  }, [remindersByDay]);

  const monthCount = useMemo(() => {
    return reminders.filter((r) => isSameMonth(parseISO(r.date), visibleMonth))
      .length;
  }, [reminders, visibleMonth]);

  function getDayReminders(day: Date) {
    return remindersByDay.get(format(day, "yyyy-MM-dd")) ?? [];
  }

  function scrollToDate(day: Date | undefined) {
    if (!day) return;
    const key = format(day, "yyyy-MM-dd");
    const node = groupRefs.current.get(key);
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "start" });
    setFlashKey(key);
    setTimeout(() => setFlashKey(null), 900);
  }

  function openEditReminder(trackerId: string) {
    setEditTrackerId(trackerId);
    setOpenEdit(true);
  }

  function confirmDeleteReminder() {
    if (!deleteTrackerId) return;
    // removeReminder(deleteTrackerId, {
    //   onSuccess: () => {
    //     setDeleteTrackerId(null);
    //   },
    // });
  }

  function ReminderDayButton({
    day,
    className,
    children,
    ...buttonProps
  }: any) {
    const dayReminders = getDayReminders(day.date);
    const color =
      dayReminders.length > 0
        ? (dayReminders[0].status_color ?? DEFAULT_STATUS_COLOR)
        : null;

    return (
      <button
        {...buttonProps}
        className={cn(
          className,
          "relative aspect-square w-8 h-8 rounded-full flex items-center justify-center",
          color && "ring-1 ring-inset",
        )}
        style={color ? { ["--tw-ring-color" as any]: color } : undefined}
      >
        {children}
        {dayReminders.length > 1 && (
          <span
            className="absolute -top-1 -right-1 flex items-center justify-center w-3.5 h-3.5 rounded-full text-[9px] text-white"
            style={{ backgroundColor: color ?? DEFAULT_STATUS_COLOR }}
          >
            {dayReminders.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Reminders by notes"
          className="pl-9 rounded-full bg-muted/40 border-transparent focus-visible:bg-background"
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:flex-[3] flex flex-col gap-3">
          <span className="text-sm text-muted-foreground">
            {monthCount} reminder{monthCount === 1 ? "" : "s"} in{" "}
            {format(visibleMonth, "MMMM yyyy")}
          </span>
          <Calendar
            mode="single"
            month={visibleMonth}
            onMonthChange={setVisibleMonth}
            onSelect={scrollToDate}
            className="rounded-xl border border-border w-full [&_table]:w-full"
            components={{ DayButton: ReminderDayButton }}
          />
        </div>

        <div className="lg:flex-[2] flex flex-col gap-5 max-h-[640px] overflow-y-auto pr-1">
          {groupedList.length === 0 && (
            <span className="text-sm text-muted-foreground">
              No reminders found
            </span>
          )}

          {groupedList.map(([dateKey, dayReminders]) => (
            <div
              key={dateKey}
              ref={(node) => {
                if (node) groupRefs.current.set(dateKey, node);
              }}
              className="flex flex-col gap-2"
            >
              <span className="text-xs font-medium text-muted-foreground">
                {format(parseISO(dateKey), "MMMM d, yyyy")}
              </span>

              {dayReminders && dayReminders.length > 0 && dayReminders.map((reminder) => (
                <motion.div
                  key={reminder._id}
                  animate={
                    flashKey === dateKey
                      ? {
                          backgroundColor: [
                            "rgba(255,255,255,0.08)",
                            "rgba(255,255,255,0)",
                          ],
                        }
                      : {}
                  }
                  transition={{ duration: 0.9 }}
                  className="flex flex-col gap-2 rounded-xl border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden">
                      {reminder.image ? (
                        <img
                          src={reminder.image}
                          alt={getCompanyName(reminder)}
                          className="object-contain w-6 h-6"
                        />
                      ) : (
                        <span className="text-xs font-medium text-black">
                          {getCompanyName(reminder)[0]}
                        </span>
                      )}
                    </span>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {getCompanyName(reminder)}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {reminder.title}
                      </p>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
                      {reminder.status ?? "NA"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${reminder.status_color ?? DEFAULT_STATUS_COLOR}1a`,
                          color: reminder.status_color ?? DEFAULT_STATUS_COLOR,
                        }}
                      >
                        <Clock className="w-2.5 h-2.5" />
                        {format(
                          parseISO(reminder.reminder_at),
                          "MMM d, h:mm a",
                        )}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Applied{" "}
                        {format(parseISO(reminder.applied_on), "MMM d, yyyy")}
                      </span>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0">
                      <AppIconButton
                        icon={<Pencil className="h-3 w-3" />}
                        tooltip="Edit reminder"
                        size="sm"
                        className="h-6 w-6"
                        onClick={() => openEditReminder(reminder._id)}
                      />
                      <AppIconButton
                        icon={<Trash2 className="h-3 w-3 text-destructive" />}
                        tooltip="Delete reminder"
                        size="sm"
                        className="h-6 w-6"
                        onClick={() => setDeleteTrackerId(reminder._id)}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {editTrackerId && (
        <AddReminder
          trackerId={editTrackerId}
          open={openEdit}
          onOpenChange={setOpenEdit}
        />
      )}

      <Dialog
        open={!!deleteTrackerId}
        onOpenChange={(v) => !v && setDeleteTrackerId(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete reminder?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This can't be undone. The reminder will be permanently removed.
          </p>
          <DialogFooter className="flex flex-row justify-end gap-2 mt-2">
            <AppVariantButton
              variant="default"
              size="sm"
              onClick={() => setDeleteTrackerId(null)}
            >
              Cancel
            </AppVariantButton>
            <AppVariantButton
              variant="danger"
              size="sm"
              onClick={confirmDeleteReminder}
            >
              Delete
            </AppVariantButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
