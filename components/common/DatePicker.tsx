"use client";

import * as React from "react";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

type AppliedDateFilterProps = {
  value?: DateRange;
  onApply: (range: DateRange | undefined) => void;
};

export default function AppliedDateFilter({ value, onApply }: AppliedDateFilterProps) {
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<DateRange | undefined>(value);

  function handleOpenChange(next: boolean) {
    if (next) setDraft(value);
    setOpen(next);
  }

  function handleSubmit() {
    onApply(draft);
    setOpen(false);
  }

  function handleClear() {
    setDraft(undefined);
    onApply(undefined);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className={cn("h-9 justify-start text-left font-normal", !value?.from && "text-muted-foreground")}
          >
            <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
            {value?.from ? (
              value.to ? (
                <>{format(value.from, "LLL dd, y")} - {format(value.to, "LLL dd, y")}</>
              ) : (
                format(value.from, "LLL dd, y")
              )
            ) : (
              <span>Applied On</span>
            )}
            <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        }
      />
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={draft?.from}
          selected={draft}
          onSelect={setDraft}
          numberOfMonths={2}
          className="p-3"
        />
        <div className="flex items-center justify-end gap-2 border-t border-border p-2">
          <Button variant="ghost" size="sm" onClick={handleClear}>
            Clear
          </Button>
          <Button size="sm" onClick={handleSubmit} disabled={!draft?.from || !draft?.to}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}