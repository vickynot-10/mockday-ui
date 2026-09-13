"use client";
import { useEffect, useMemo, useState } from "react";
import { useForm, Controller, Control, useWatch } from "react-hook-form";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import {
  Bell,
  CalendarIcon,
  ChevronDown,
  Clock,
  Trash2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AppButton } from "@/components/common/AppButton";
import { Calendar } from "@/components/ui/calendar";
import Tooltip from "@/components/common/ToolTip";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  useRemindersTrackers,
  useSaveRemindersTrackers,
  useRemoveRemindersTrackers,
  useGetAllTrackers,
} from "@/hooks/queries/useTrackers";

type ReminderFormValues = {
  fk_tracker_id: string | null;
  date: string;
  time: string;
  note: string;
};

type AddReminderProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reminder_id?: string;
  tracker_id?: string;
};

type TrackerOption = { _id: string; company: string };

const NOTE_SUGGESTIONS = [
  "Follow up with recruiter",
  "Prepare for interview",
  "Send thank you email",
  "Check application status",
  "Review job description again",
];

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) =>
  i.toString().padStart(2, "0"),
);
const MINUTE_OPTIONS = Array.from({ length: 12 }, (_, i) =>
  (i * 5).toString().padStart(2, "0"),
);

function TimeField({
  control,
  minTime,
}: {
  control: Control<ReminderFormValues>;
  minTime?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Controller
      control={control}
      name="time"
      rules={{
        required: "Time is required",
        validate: (value) =>
          !minTime ||
          value >= minTime ||
          "Time should not be lesser than current time",
      }}
      render={({ field, fieldState }) => {
        const [hour, minute] = field.value ? field.value.split(":") : ["", ""];

        function update(nextHour: string, nextMinute: string) {
          field.onChange(`${nextHour}:${nextMinute}`);
        }

        return (
          <div className="flex flex-col gap-1.5">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center gap-2 text-left font-normal h-10 px-3"
                  >
                    <Clock className="h-4 w-4 opacity-70 shrink-0" />
                    <span className="flex-1 truncate">
                      {field.value ? `${hour}:${minute}` : "Select time"}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                  </Button>
                }
              />
              <PopoverContent className="w-auto p-0" align="start">
                <div className="flex h-56">
                  <div className="flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] border-r border-border px-1 py-1 w-14">
                    {HOUR_OPTIONS.map((h) => (
                      <motion.button
                        key={h}
                        type="button"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => update(h, minute || "00")}
                        className={cn(
                          "text-sm py-1.5 rounded-md text-center text-muted-foreground hover:bg-accent",
                          hour === h &&
                            "bg-primary/10 text-primary font-medium",
                        )}
                      >
                        {h}
                      </motion.button>
                    ))}
                  </div>

                  <div className="flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] px-1 py-1 w-14">
                    {MINUTE_OPTIONS.map((m) => (
                      <motion.button
                        key={m}
                        type="button"
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => update(hour || "00", m)}
                        className={cn(
                          "text-sm py-1.5 rounded-md text-center text-muted-foreground hover:bg-accent",
                          minute === m &&
                            "bg-primary/10 text-primary font-medium",
                        )}
                      >
                        {m}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            {fieldState.error && (
              <span className="text-xs text-destructive">
                {fieldState.error.message}
              </span>
            )}
          </div>
        );
      }}
    />
  );
}

function TrackerField({
  control,
  trackers,
}: {
  control: Control<ReminderFormValues>;
  trackers: TrackerOption[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Controller
      control={control}
      name="fk_tracker_id"
      rules={{ required: "Tracker is required" }}
      render={({ field, fieldState }) => {
        const selected = trackers.find((t) => t._id === field.value);

        return (
          <div className="flex flex-col gap-1.5">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full flex items-center gap-2 text-left font-normal h-10 px-3",
                      !selected && "text-muted-foreground",
                    )}
                  >
                    <span className="flex-1 truncate">
                      {selected ? selected.company : "Select tracker"}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                  </Button>
                }
              />
              <PopoverContent className="w-56 p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search company..." />
                  <CommandList>
                    <CommandEmpty>No tracker found.</CommandEmpty>
                    <CommandGroup>
                      {trackers.map((tracker) => (
                        <CommandItem
                          key={tracker._id}
                          value={tracker.company}
                          onSelect={() => {
                            field.onChange(tracker._id);
                            setOpen(false);
                          }}
                        >
                          <span className="flex-1 truncate">
                            {tracker.company}
                          </span>
                          {tracker._id === field.value && (
                            <Check className="h-3.5 w-3.5 shrink-0" />
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {fieldState.error && (
              <span className="text-xs text-destructive">
                {fieldState.error.message}
              </span>
            )}
          </div>
        );
      }}
    />
  );
}

function ReminderFormSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-3 w-10" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex flex-col gap-1.5 col-span-2">
          <Skeleton className="h-3 w-10" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

export default function AddReminder({
  reminder_id,
  open,
  onOpenChange,
  tracker_id,
}: AddReminderProps) {
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [isDataFOund, setDataFound] = useState(false);
  const { data, isFetching } = useRemindersTrackers(reminder_id, open);

  const { data: trackersData } = useGetAllTrackers();

  const { mutate, isPending } = useSaveRemindersTrackers();
  const { mutate: remove, isPending: removing } = useRemoveRemindersTrackers();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ReminderFormValues>({
    defaultValues: {
      fk_tracker_id: tracker_id ?? null,
      date: "",
      time: "",
      note: "",
    },
  });

  const noteValue = useWatch({ control, name: "note" });
  const dateValue = useWatch({ control, name: "date" });

  const trackers: TrackerOption[] = trackersData?.data?.docs ?? [];

  useEffect(() => {
    if (!open) {
      setDataFound(false);
      return;
    }

    if (!reminder_id) {
      setDataFound(false);
      const now = new Date();
      now.setMinutes(now.getMinutes() + 2);
      reset({
        fk_tracker_id: tracker_id ?? null,
        date: now.toISOString(),
        time: format(now, "HH:mm"),
        note: "",
      });
      return;
    }

    if (data?.success && data?.data) {
      setDataFound(true);
      reset({
        fk_tracker_id: data.data.fk_tracker_id,
        date: data.data.date,
        time: data.data.time,
        note: data.data.note,
      });
    }
  }, [open, reminder_id, data, tracker_id]);

  const minTime = useMemo(() => {
    if (!dateValue) return undefined;
    const selected = new Date(dateValue);
    const now = new Date();
    if (selected.toDateString() !== now.toDateString()) return undefined;
    return format(now, "HH:mm");
  }, [dateValue]);

  function applySuggestion(suggestion: string) {
    setValue("note", suggestion, { shouldDirty: true });
  }

  function RemoveReminder() {
    if (!reminder_id) return;
    remove(reminder_id, {
      onSuccess: () => {
        CloseModal();
      },
    });
  }

  function CloseModal() {
    onOpenChange(false);
  }

  function onSubmit(values: ReminderFormValues) {
    const picked_date = new Date(values.date);
    const [hours, minutes] = values.time.split(":").map(Number);

    const reminder_at = new Date(
      picked_date.getFullYear(),
      picked_date.getMonth(),
      picked_date.getDate(),
      hours,
      minutes,
      0,
      0,
    );
    const payload: any = {
      ...values,
      reminder_at_utc: reminder_at.toISOString(),
    };

    if (reminder_id) {
      payload.reminder_id = reminder_id;
    }
    mutate(payload, {
      onSuccess: () => {
        CloseModal();
      },
    });
  }

  function handleDateChange(
    selected_date: Date | undefined,
    field: { onChange: (value: string) => void },
  ) {
    field.onChange(selected_date ? selected_date.toISOString() : "");
    setDatePopoverOpen(false);
  }

  function handleDialogOpenChange(
    next_open: boolean,
    eventDetails: { reason?: string },
  ) {
    if (eventDetails.reason === "outside-press") return;
    onOpenChange(next_open);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="flex flex-1 items-center gap-2">
              <Bell className="h-4 w-4 text-muted-foreground" />
              {isDataFOund ? "Edit Reminder" : "Set Reminder"}
            </span>
            {isDataFOund && reminder_id && (
              <Tooltip content="Delete reminder" side="top">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive hover:text-destructive"
                  onClick={RemoveReminder}
                  disabled={removing}
                >
                  <Trash2 className="size-4" />
                </Button>
              </Tooltip>
            )}
          </DialogTitle>
        </DialogHeader>
        {isFetching && <ReminderFormSkeleton />}

        <AnimatePresence mode="wait">
          {!isFetching && (
            <motion.form
              key="reminder-form"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Tracker</Label>
                <TrackerField control={control} trackers={trackers} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground">Date</Label>
                  <Controller
                    control={control}
                    name="date"
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Popover
                        open={datePopoverOpen}
                        onOpenChange={setDatePopoverOpen}
                      >
                        <PopoverTrigger
                          render={
                            <Button
                              type="button"
                              variant="outline"
                              className={cn(
                                "w-full flex items-center gap-2 text-left font-normal h-10 px-3",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="h-4 w-4 opacity-70 shrink-0" />
                              <span className="flex-1 truncate">
                                {field.value ? (
                                  format(new Date(field.value), "PPP")
                                ) : (
                                  <span>Select a date</span>
                                )}
                              </span>
                              <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                            </Button>
                          }
                        />
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={
                              field.value ? new Date(field.value) : undefined
                            }
                            onSelect={(selected_date) =>
                              handleDateChange(selected_date, field)
                            }
                            disabled={(check_date) => check_date < today}
                            className="rounded-md border-none"
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                  {errors.date && (
                    <span className="text-xs text-destructive">
                      Date is required
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                    Time
                  </Label>
                  <TimeField control={control} minTime={minTime} />
                </div>

                <div className="flex flex-col gap-1.5 col-span-2">
                  <Label
                    htmlFor="reminder_note"
                    className="text-xs text-muted-foreground"
                  >
                    Note
                  </Label>
                  <Controller
                    control={control}
                    name="note"
                    render={({ field }) => (
                      <Input
                        id="reminder_note"
                        placeholder="e.g. Follow up with recruiter"
                        {...field}
                      />
                    )}
                  />
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {NOTE_SUGGESTIONS.map((suggestion, index) => (
                      <motion.button
                        key={suggestion}
                        type="button"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15, delay: index * 0.03 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => applySuggestion(suggestion)}
                        className={cn(
                          "text-[11px] px-2.5 py-1 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors",
                          noteValue === suggestion &&
                            "border-primary text-primary",
                        )}
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="flex items-center justify-end gap-2">
                <AppButton
                  variant="secondary"
                  onClick={CloseModal}
                  type="button"
                  disabled={isPending}
                  idleLabel="Cancel"
                  className="h-10 min-w-30"
                />
                <AppButton
                  type="submit"
                  isLoading={isPending}
                  idleLabel={isDataFOund ? "Save Changes" : "Add"}
                  loadingLabel={isDataFOund ? "Saving..." : "Adding..."}
                  successLabel={isDataFOund ? "Saved!" : "Added"}
                  className="h-10 min-w-30"
                />
              </DialogFooter>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
