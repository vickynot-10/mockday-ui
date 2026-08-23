"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  setMonth,
  setYear,
  isSameDay,
  isSameMonth,
  isToday,
  getYear,
} from "date-fns";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type ViewMode = "day" | "month" | "year";

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default function DatePicker({ value, onChange, placeholder = "Select date...", disabled }: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<ViewMode>("day");
  const [viewDate, setViewDate] = useState(value || new Date());
  const [pendingDate, setPendingDate] = useState<Date | undefined>(value);

  function OpenPicker() {
    if (disabled) return;
    setPendingDate(value);
    setViewDate(value || new Date());
    setView("day");
    setOpen(true);
  }

  function HandleOpenChange(next: boolean) {
    if (!next) setPendingDate(value);
    setOpen(next);
  }

  function HandleCancel() {
    setPendingDate(value);
    setOpen(false);
  }

  function HandleApply() {
    onChange(pendingDate);
    setOpen(false);
  }

  function GoPrev() {
    if (view === "day") setViewDate((d) => subMonths(d, 1));
    else if (view === "year") setViewDate((d) => setYear(d, getYear(d) - 12));
  }

  function GoNext() {
    if (view === "day") setViewDate((d) => addMonths(d, 1));
    else if (view === "year") setViewDate((d) => setYear(d, getYear(d) + 12));
  }

  function PickDay(day: Date) {
    setPendingDate(day);
  }

  function PickMonth(monthIndex: number) {
    setViewDate((d) => setMonth(d, monthIndex));
    setView("day");
  }

  function PickYear(year: number) {
    setViewDate((d) => setYear(d, year));
    setView("month");
  }

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);

  const days: Date[] = [];
  let cursor = gridStart;
  while (cursor <= gridEnd) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }

  const yearRangeStart = Math.floor(getYear(viewDate) / 12) * 12;
  const years = Array.from({ length: 12 }, (_, i) => yearRangeStart + i);

  return (
    <>
      <button
        type="button"
        onClick={OpenPicker}
        disabled={disabled}
        className="w-full h-10 px-3 rounded-lg border border-border bg-background text-left text-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {value ? format(value, "PPP") : <span className="text-muted-foreground">{placeholder}</span>}
      </button>

      <Dialog open={open} onOpenChange={HandleOpenChange}>
        <DialogContent className="w-[320px] p-4 gap-0">
          <DialogTitle className="sr-only">Select date</DialogTitle>

          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="flex items-center rounded-full bg-muted p-1 gap-1">
              {(["day", "month", "year"] as ViewMode[]).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setView(mode)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                    view === mode
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {view !== "month" && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={GoPrev}
                  className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={GoNext}
                  className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="text-center text-sm font-semibold mb-4">
            {view === "day" && format(viewDate, "MMMM yyyy")}
            {view === "month" && format(viewDate, "yyyy")}
            {view === "year" && `${years[0]} - ${years[years.length - 1]}`}
          </div>

          {view === "day" && (
            <div>
              <div className="grid grid-cols-7 mb-2">
                {WEEKDAYS.map((day) => (
                  <div key={day} className="text-center text-xs text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-y-1">
                {days.map((day) => {
                  const outside = !isSameMonth(day, viewDate);
                  const selected = pendingDate && isSameDay(day, pendingDate);
                  const today = isToday(day);
                  return (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => PickDay(day)}
                      className={`h-9 w-9 mx-auto flex items-center justify-center rounded-lg text-sm transition-colors ${
                        outside ? "text-muted-foreground/40" : "text-foreground"
                      } ${selected ? "bg-foreground text-background font-semibold" : ""} ${
                        !selected && today ? "border border-border" : ""
                      } ${!selected ? "hover:bg-muted" : ""}`}
                    >
                      {format(day, "d")}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {view === "month" && (
            <div className="grid grid-cols-3 gap-2">
              {MONTHS.map((label, index) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => PickMonth(index)}
                  className={`h-10 rounded-lg text-sm transition-colors ${
                    index === viewDate.getMonth()
                      ? "bg-foreground text-background font-semibold"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {view === "year" && (
            <div className="grid grid-cols-3 gap-2">
              {years.map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => PickYear(year)}
                  className={`h-10 rounded-lg text-sm transition-colors ${
                    year === getYear(viewDate)
                      ? "bg-foreground text-background font-semibold"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={HandleCancel}>
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={HandleApply}>
              Apply
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}