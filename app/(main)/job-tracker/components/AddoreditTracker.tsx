"use client";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { useGetTrackerByID, useSaveTracker } from "@/hooks/queries/useTrackers";
import BreadCrumbs from "@/components/common/Breadcrumbs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AppButton } from "@/components/common/AppButton";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  CalendarIcon,
  Clock,
  ChevronDown,
  FileText,
  StickyNote,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TrackerForm } from "@/types/tracker.types";
import AppVariantButton from "@/components/common/AppVariantButton";
import TrackerFormSkeleton from "@/loaders/tracker-form.loader";
import { useRouter } from "next/navigation";

const EMPTY_FORM: TrackerForm = {
  company: "",
  title: "",
  url: "",
  description: "",
  page_title: "",
  h1: "",
  site_name: "",
  notes: "",
  reminder_date: undefined,
  reminder_time: "",
  reminder_note: "",
};

const tabs = [
  { id: "details", label: "Job Details", icon: FileText },
  { id: "notes", label: "Notes & Reminder", icon: StickyNote },
];

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
};

const transition = { type: "spring", stiffness: 340, damping: 32 } as const;

type EditProps = {
  id?: string;
};

export default function AddOrEditJobTracker({ id }: EditProps) {
  const { data, isLoading } = useGetTrackerByID(id);
  const { mutate, isPending } = useSaveTracker();
  const [datePopoverOpen, setDatePopoverOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [direction, setDirection] = useState(1);

  const { register, handleSubmit, reset, control, watch, formState } =
    useForm<TrackerForm>({
      defaultValues: EMPTY_FORM,
    });

  useEffect(() => {
    if (!data?.data) return;
    reset({
      ...EMPTY_FORM,
      ...data.data,
      reminder_date: data.data.reminder_date
        ? new Date(data.data.reminder_date)
        : undefined,
    });
  }, [data]);

  const router = useRouter();

  if (isLoading) {
    return <TrackerFormSkeleton />;
  }

  function onSubmit(values: TrackerForm) {
    const payload = id ? { ...values, _id: id } : values;
    mutate(payload);
  }

  function GoBack() {
    router.push("/job-tracker");
  }
  function handleTabChange(newId: string) {
    const prevIdx = tabs.findIndex((t) => t.id === activeTab);
    const nextIdx = tabs.findIndex((t) => t.id === newId);
    setDirection(nextIdx > prevIdx ? 1 : -1);
    setActiveTab(newId);
  }

  const selectedDate = watch("reminder_date");
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isToday =
    selectedDate instanceof Date &&
    selectedDate.toDateString() === new Date().toDateString();

  const minTime = isToday
    ? `${String(new Date().getHours()).padStart(2, "0")}:${String(
        new Date().getMinutes(),
      ).padStart(2, "0")}`
    : "00:00";

  const breadcrumb_items = [
    { label: "Apps", isSection: true },
    { label: "Trackers", href: "/job-tracker" },
    { label: id ? "Edit" : "Add" },
  ];
  return (
    <>
      <BreadCrumbs items={breadcrumb_items} />

      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col mt-4 overflow-x-hidden h-[calc(100vh-140px)]"
      >
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full shrink-0"
        >
          <TabsList
            variant="line"
            className="flex w-full border-b border-border overflow-x-hidden bg-transparent p-0! rounded-none h-auto! gap-0! justify-start!"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    "relative flex items-center justify-center cursor-pointer text-sm font-medium transition-colors outline-none whitespace-nowrap bg-transparent",
                    "data-[state=active]:bg-transparent data-[state=active]:text-foreground",
                    "dark:data-[state=active]:bg-transparent dark:data-[state=active]:border-transparent dark:data-[state=active]:text-foreground",
                    "border-transparent data-[state=active]:border-transparent shadow-none data-[state=active]:shadow-none after:hidden",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span className="relative flex items-center gap-2 px-4 py-3 rounded-md z-10">
                    <Icon className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">{tab.label}</span>
                  </span>

                  {isActive && (
                    <motion.div
                      layoutId="tracker-tabs-indicator"
                      className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-primary"
                      initial={false}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden mt-4 relative">
          <AnimatePresence mode="wait" custom={direction}>
            {activeTab === "details" && (
              <motion.div
                key="details"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={transition}
                className="flex flex-col gap-6"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      {...register("company", { required: true })}
                    />
                    {formState.errors.company && (
                      <p className="text-xs text-destructive">
                        Company is required
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="title">Role</Label>
                    <Input id="title" {...register("title")} />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="url">Job URL</Label>
                    <Input id="url" {...register("url")} />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="site_name">Source Site</Label>
                    <Input id="site_name" {...register("site_name")} />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="page_title">Page Title</Label>
                    <Input id="page_title" {...register("page_title")} />
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label htmlFor="h1">Page Heading</Label>
                    <Input id="h1" {...register("h1")} />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={10}
                    {...register("description")}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === "notes" && (
              <motion.div
                key="notes"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={transition}
                className="flex flex-col gap-6"
              >
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Reminder</Label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Date
                    </Label>
                    <Controller
                      control={control}
                      name="reminder_date"
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
                                  format(field.value, "PPP")
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
                              selected={field.value}
                              onSelect={(selected_date) => {
                                field.onChange(selected_date);
                                setDatePopoverOpen(false);
                              }}
                              disabled={(check_date) => check_date < today}
                              className="rounded-md border-none"
                            />
                          </PopoverContent>
                        </Popover>
                      )}
                    />
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
                      {...register("reminder_time")}
                    />
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
                      {...register("reminder_note")}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="notes">Explained Notes</Label>
                  <Textarea id="notes" rows={8} {...register("notes")} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-end shrink-0 gap-3 pt-4 border-t border-border mt-4">
          <AppVariantButton
            type="button"
            variant="outline"
            size="sm"
            className="min-w-44 h-[46px] rounded-xl"
            onClick={GoBack}
          >
            Go Back
          </AppVariantButton>
          <AppButton
            type="button"
            isLoading={isPending}
            onClick={handleSubmit(onSubmit)}
            idleLabel={id ? "Save Changes" : "Create Tracker"}
            loadingLabel={id ? "Saving..." : "Creating..."}
            successLabel={id ? "Saved!" : "Created!"}
          />
        </div>
      </form>
    </>
  );
}
