"use client";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { format } from "date-fns";
import { Bell, CalendarIcon, ChevronDown, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ReminderFormValues = {
  tracker_id: string;
  date: string;
  time: string;
  note: string;
};

type AddReminderProps = {
  trackerId: string;
};

export default function AddReminder({ trackerId }: AddReminderProps) {
  const [open, setOpen] = useState(false);
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);

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
      tracker_id: trackerId,
      date: "",
      time: "",
      note: "",
    },
  });

  const minTime =
    new Date().toDateString() === today.toDateString()
      ? format(new Date(), "HH:mm")
      : undefined;

  function onSubmit(values: ReminderFormValues) {
    console.log(values);
    setOpen(false);
    reset({ tracker_id: trackerId, date: "", time: "", note: "" });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button type="button" variant="outline" size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" />
            Add Reminder
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            Set Reminder
          </DialogTitle>
        </DialogHeader>

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
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(selected_date) => {
                          field.onChange(
                            selected_date
                              ? format(selected_date, "yyyy-MM-dd")
                              : "",
                          );
                          setDatePopoverOpen(false);
                        }}
                        disabled={(check_date) => check_date < today}
                        className="rounded-md border-none"
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.date && (
                <span className="text-xs text-destructive">Date is required</span>
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
                {...register("time", { required: true })}
              />
              {errors.time && (
                <span className="text-xs text-destructive">Time is required</span>
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
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Add</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}