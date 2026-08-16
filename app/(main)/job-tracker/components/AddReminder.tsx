"use client";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { format } from "date-fns";
import { Bell, CalendarIcon, ChevronDown, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AppButton } from "@/components/common/AppButton";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
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
} from "@/hooks/queries/useTrackers";

type ReminderFormValues = {
  fk_tracker_id: string;
  date: string;
  time: string;
  note: string;
};

type AddReminderProps = {
  trackerId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function ReminderFormSkeleton() {
  return (
    <div className="flex flex-col gap-4">
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
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

export default function AddReminder({
  trackerId,
  open,
  onOpenChange,
}: AddReminderProps) {
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [isDataFOund, setDataFound] = useState(false);
  const { data, isLoading } = useRemindersTrackers(trackerId);

  const { mutate, isPending } = useSaveRemindersTrackers();
  const { mutate: remove, isPending: removing } = useRemoveRemindersTrackers();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReminderFormValues>({
    defaultValues: {
      fk_tracker_id: trackerId,
      date: "",
      time: "",
      note: "",
    },
  });

  useEffect(() => {
    if (!data || !data.data || !data.success) return;
    setDataFound(true);
    reset(data.data);
  }, [data]);

  const minTime =
    new Date().toDateString() === today.toDateString()
      ? format(new Date(), "HH:mm")
      : undefined;

  function RemoveReminder() {
    remove(trackerId, {
      onSuccess: () => {
        CloseModal();
      },
    });
  }

  function CloseModal() {
    reset({ fk_tracker_id: trackerId, date: "", time: "", note: "" });
    onOpenChange(false);
  }

  function onSubmit(values: ReminderFormValues) {
    mutate(values, {
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

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            Set Reminder
          </DialogTitle>
        </DialogHeader>
        {isLoading && <ReminderFormSkeleton />}

        {!isLoading && (
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
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
                              "w-full justify-start text-left font-normal h-10",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4 opacity-70" />
                            {field.value ? (
                              format(new Date(field.value), "PPP")
                            ) : (
                              <span>Select a date</span>
                            )}
                            <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
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
                <Label
                  htmlFor="reminder_time"
                  className="text-xs text-muted-foreground flex items-center gap-1.5"
                >
                  <Clock className="size-3.5" /> Time
                </Label>
                <Input
                  id="reminder_time"
                  type="time"
                  min={minTime}
                  {...register("time", {
                    required: "Time is required",
                    validate: (value) =>
                      !minTime ||
                      value >= minTime ||
                      "Time should not be lesser than current time",
                  })}
                />
                {errors.time && (
                  <span className="text-xs text-destructive">
                    {errors.time.message}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5 col-span-2">
                <Label
                  htmlFor="reminder_note"
                  className="text-xs text-muted-foreground"
                >
                  Note
                </Label>
                <Input
                  id="reminder_note"
                  placeholder="e.g. Follow up with recruiter"
                  {...register("note")}
                />
              </div>
            </div>

            <DialogFooter>
              <AppButton
                type="button"
                onClick={RemoveReminder}
                isLoading={removing}
                idleLabel="Remove"
                loadingLabel="Adding..."
                successLabel="Added"
              />
              <AppButton
                type="submit"
                isLoading={isPending}
                idleLabel="Add"
                loadingLabel="Adding..."
                successLabel="Added"
                className=" min-w-30"
              />
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
