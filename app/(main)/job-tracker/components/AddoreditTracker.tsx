"use client";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "motion/react";
import { useHotkeys } from "react-hotkeys-hook";
import { useGetTrackerByID, useSaveTracker } from "@/hooks/queries/useTrackers";
import { useGetAllStatus } from "@/hooks/queries/useStatus";
import BreadCrumbs from "@/components/common/Breadcrumbs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AppButton } from "@/components/common/AppButton";
import AppIconButton from "@/components/common/AppIconButton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, StickyNote, Plus, Trash2 } from "lucide-react";
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
  status: null,
  notes: [],
};

const tabs = [
  { id: "details", label: "Job Details", icon: FileText },
  { id: "notes", label: "Notes", icon: StickyNote },
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
  const { data: statusData } = useGetAllStatus();
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [direction, setDirection] = useState(1);
  const [focusedNoteIndex, setFocusedNoteIndex] = useState<number | null>(null);
  const noteRefs = useRef<(HTMLInputElement | null)[]>([]);

  const statuses = statusData?.data ?? [];
  const initialValues = useRef<TrackerForm>(EMPTY_FORM);

  const { register, handleSubmit, reset, formState, watch, setValue } =
    useForm<TrackerForm>({
      defaultValues: EMPTY_FORM,
    });

  const currentStatus = watch("status");
  const notes = watch("notes") || [];

  useEffect(() => {
    if (!data?.data) return;
    const rawNotes = data.data.notes;
    const notesArray: string[] = Array.isArray(rawNotes)
      ? rawNotes
      : rawNotes
      ? [rawNotes]
      : [];

    const loaded: TrackerForm = {
      ...EMPTY_FORM,
      ...data.data,
      status: data.data.status ?? null,
      notes: notesArray,
    };
    reset(loaded);
    initialValues.current = loaded;
  }, [data]);

  const router = useRouter();

  function AddNote() {
    setValue("notes", [...notes, ""], { shouldDirty: true });
  }

  function AddNoteAt(index: number) {
    const next = [...notes];
    next.splice(index + 1, 0, "");
    setValue("notes", next, { shouldDirty: true });
  }

  function RemoveNote(index: number) {
    const next = [...notes];
    next.splice(index, 1);
    setValue("notes", next, { shouldDirty: true });

    const nextFocusIndex = index > 0 ? index - 1 : 0;
    setFocusedNoteIndex(next.length > 0 ? nextFocusIndex : null);

    requestAnimationFrame(() => {
      noteRefs.current[nextFocusIndex]?.focus();
    });
  }

  function SelectStatus(status_id: string) {
    setValue("status", status_id, { shouldDirty: true });
  }

  useHotkeys(
    "ctrl+enter",
    (e) => {
      e.preventDefault();
      if (activeTab !== "notes") return;
      const at = focusedNoteIndex ?? notes.length - 1;
      AddNoteAt(at);
    },
    { enableOnFormTags: true },
    [activeTab, focusedNoteIndex, notes.length],
  );

  useHotkeys(
    "ctrl+shift+backspace",
    (e) => {
      e.preventDefault();
      if (activeTab !== "notes") return;
      if (focusedNoteIndex === null) return;
      RemoveNote(focusedNoteIndex);
    },
    { enableOnFormTags: true },
    [activeTab, focusedNoteIndex],
  );

  if (isLoading) {
    return <TrackerFormSkeleton />;
  }

  function onSubmit(values: TrackerForm) {
    const values_notes = values.notes.filter(Boolean);

    const payload = id
      ? { ...values, notes: values_notes, _id: id }
      : { ...values, notes: values_notes };

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
                <div className="flex flex-col gap-3">
                  <Label>Status</Label>
                  <div className="flex flex-wrap gap-2">
                    {statuses.map((item: any) => {
                      const isActive = item._id === currentStatus;
                      return (
                        <button
                          key={item._id}
                          type="button"
                          onClick={() => SelectStatus(item._id)}
                          className={cn(
                            "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
                            isActive
                              ? "border-primary bg-primary/10 text-foreground"
                              : "border-border text-muted-foreground hover:text-foreground hover:bg-accent/50",
                          )}
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.color }}
                          />
                          {item.name}
                        </button>
                      );
                    })}

                    {statuses.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No statuses created yet
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <Label>Notes</Label>
                    <AppIconButton
                      icon={<Plus className="h-4 w-4" />}
                      tooltip="Add Note"
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={AddNote}
                      type="button"
                    />
                  </div>

                  {notes.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Ctrl + Enter to add a row · Ctrl + Shift + Backspace to delete the current row
                    </p>
                  )}

                  <AnimatePresence initial={false}>
                    {notes.map((_, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        className="flex items-start gap-2"
                      >
                        {(() => {
                          const { ref: registerRef, ...rest } = register(
                            `notes.${index}`,
                          );
                          return (
                            <Input
                              ref={(el) => {
                                registerRef(el);
                                noteRefs.current[index] = el;
                              }}
                              placeholder="e.g. Recruiter mentioned second round next week"
                              onFocus={() => setFocusedNoteIndex(index)}
                              {...rest}
                            />
                          );
                        })()}
                        <AppIconButton
                          icon={<Plus className="h-4 w-4" />}
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 shrink-0"
                          onClick={() => AddNoteAt(index)}
                          type="button"
                        />
                        <AppIconButton
                          icon={<Trash2 className="h-4 w-4" />}
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-destructive shrink-0"
                          onClick={() => RemoveNote(index)}
                          type="button"
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {notes.length === 0 && (
                    <button
                      type="button"
                      onClick={AddNote}
                      className="flex flex-col items-center justify-center gap-2 border border-dashed border-border rounded-lg py-10 text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
                    >
                      <span className="flex items-center justify-center w-9 h-9 rounded-full border border-border">
                        <Plus className="h-4 w-4" />
                      </span>
                      <span className="text-sm">No notes yet — add one</span>
                    </button>
                  )}
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