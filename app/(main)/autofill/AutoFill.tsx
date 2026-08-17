"use client";
import BreadCrumbs from "@/components/common/Breadcrumbs";
import { useForm, useFieldArray } from "react-hook-form";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, Save, ListPlus, Briefcase, ListChecks, CircleUserRound } from "lucide-react";
import AutoFillSkeleton from "@/loaders/autofill.loader";
import { useState, useEffect, useRef, useCallback } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { AppButton } from "@/components/common/AppButton";
import AppVariantButton from "@/components/common/AppVariantButton";
import DatePicker from "./components/DatePicker";
import { useGetAutoFill, useSaveAutoFill } from "@/hooks/queries/useAutofills";

const items = [{ label: "Apps", isSection: true }, { label: "Autofills" }];

type FieldRule = {
  label: string;
  answer: string;
};

type Experience = {
  point: string;
  start_date: string;
  end_date: string | null;
  currently_working_on: boolean;
};

type FormValues = {
  email: string;
  phone: string;
  experience: Experience[];
  rules: FieldRule[];
};

const tabs = [
  { id: "details", label: "Default Fields", icon: Briefcase },
  { id: "rules", label: "Field Rules", icon: ListChecks },
  { id: "about_you", label: "About You", icon: CircleUserRound },
];

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
};

const transition = { type: "spring", stiffness: 340, damping: 32 } as const;

function formatUpdatedOn(dateStr?: string) {
  if (!dateStr) return null;
  return new Intl.DateTimeFormat(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateStr));
}

export default function AutoFill() {
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [direction, setDirection] = useState(1);
  const { isLoading, data } = useGetAutoFill();
  const { mutate, isPending } = useSaveAutoFill();
  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      email: "",
      phone: "",
      experience: [],
      rules: [{ label: "", answer: "" }],
    },
  });

  const hasHydrated = useRef(false);
  const { fields, append, remove } = useFieldArray({
    control,
    name: "rules",
  });

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
  } = useFieldArray({
    control,
    name: "experience",
  });

  const experienceValues = watch("experience") || [];

  useEffect(() => {
    if (!data || !data?.data || hasHydrated.current) return;
    hasHydrated.current = true;
    const { email, phone, experience, _id, created_on, updated_on, ...rest } =
      data.data;

    const rules = Object.entries(rest).map(([label, answer]) => ({
      label,
      answer: answer as string,
    }));

    reset({
      email: email ?? "",
      phone: phone ?? "",
      experience: Array.isArray(experience) ? experience : [],
      rules: rules.length > 0 ? rules : [{ label: "", answer: "" }],
    });
  }, [data, reset]);

  useHotkeys(
    "ctrl+enter",
    (event) => {
      event.preventDefault();
      if (activeTab !== "rules") return;
      AddItem();
    },
    {
      enableOnFormTags: ["INPUT"],
      preventDefault: true,
    },
    [activeTab],
  );

  useHotkeys(
    "ctrl+shift+backspace",
    (event) => {
      event.preventDefault();
      if (activeTab !== "rules") return;
      const target = event.target as HTMLInputElement;
      const match = target.name?.match(/^rules\.(\d+)\./);
      if (!match) return;
      const index = Number(match[1]);
      if (fields.length <= 1) return;
      RemoveItem(index);
    },
    {
      enableOnFormTags: ["INPUT"],
      preventDefault: true,
    },
    [activeTab, fields.length],
  );

  const AddItem = useCallback(() => {
    append({
      label: "",
      answer: "",
    });
  }, [append]);

  const RemoveItem = useCallback(
    (index: number) => {
      remove(index);
      requestAnimationFrame(() => {
        const nextInput = document.querySelector<HTMLInputElement>(
          `input[name="rules.${index}.label"]`,
        );
        nextInput?.focus();
      });
    },
    [remove],
  );

  const AddExperience = useCallback(() => {
    appendExperience({
      point: "",
      start_date: "",
      end_date: "",
      currently_working_on: false,
    });
  }, [appendExperience]);

  const ToggleCurrentlyWorking = (index: number, checked: boolean) => {
    setValue(`experience.${index}.currently_working_on`, checked, {
      shouldDirty: true,
    });
    setValue(`experience.${index}.end_date`, checked ? null : "", {
      shouldDirty: true,
    });
  };

  const handleStartDateChange = (index: number, date: Date | undefined) => {
    setValue(
      `experience.${index}.start_date`,
      date ? format(date, "yyyy-MM-dd") : "",
      { shouldDirty: true },
    );
  };

  const handleEndDateChange = (index: number, date: Date | undefined) => {
    setValue(
      `experience.${index}.end_date`,
      date ? format(date, "yyyy-MM-dd") : "",
      { shouldDirty: true },
    );
  };

  function handleTabChange(newId: string) {
    const prevIdx = tabs.findIndex((t) => t.id === activeTab);
    const nextIdx = tabs.findIndex((t) => t.id === newId);
    setDirection(nextIdx > prevIdx ? 1 : -1);
    setActiveTab(newId);
  }

  if (isLoading) {
    return <AutoFillSkeleton />;
  }

  const onSubmit = (data: FormValues) => {
    const rulesObject = Object.fromEntries(
      data.rules
        .map((r) => ({ label: r.label.trim(), answer: r.answer.trim() }))
        .filter((r) => r.label !== "" || r.answer !== "")
        .map((r) => [r.label, r.answer]),
    );

    const experiencePayload = data.experience
      .filter((e) => e.point.trim() !== "" || e.start_date !== "")
      .map((e) => ({
        point: e.point.trim(),
        start_date: e.start_date,
        end_date: e.currently_working_on ? null : e.end_date,
        currently_working_on: e.currently_working_on,
      }));

    const payload = {
      email: data.email.trim(),
      phone: data.phone.trim(),
      experience: experiencePayload,
      ...rulesObject,
    };

    mutate(payload);
  };

  function CloseDialog() {
    setResetDialogOpen(false);
  }

  function OpenDialog() {
    setResetDialogOpen(true);
  }

  const confirmResetForm = () => {
    reset();
    setResetDialogOpen(false);
  };

  const lastUpdated = formatUpdatedOn(data?.data?.updated_on);

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <BreadCrumbs items={items} />
        {lastUpdated && (
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full shrink-0 mb-4"
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
                      layoutId="autofill-tabs-indicator"
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

        <div className="space-y-8 pb-24 relative overflow-x-hidden">
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
                className="space-y-8"
              >
                <div className="rounded-xl border border-border bg-card p-6">
                  <h2 className="text-lg font-semibold mb-4">Default Fields</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm text-muted-foreground">
                        Email
                      </label>
                      <input
                        {...register("email")}
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        placeholder="john@example.com"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm text-muted-foreground">
                        Phone
                      </label>
                      <input
                        {...register("phone")}
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-lg font-semibold">Experience</h2>
                    <AppVariantButton
                      type="button"
                      size="sm"
                      onClick={AddExperience}
                    >
                      <Plus className="w-4 h-4" />
                      Add Experience
                    </AppVariantButton>
                  </div>

                  <p className="text-xs text-muted-foreground mb-4">
                    Add your work experience points. Toggle "Currently
                    working" to leave the end date empty.
                  </p>

                  <div className="space-y-4">
                    {experienceFields.length <= 0 && (
                      <div className="flex flex-col items-center justify-center gap-6 pb-6 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                          <ListPlus className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            No experience added yet
                          </p>
                          <p className="text-sm mt-2 text-muted-foreground">
                            Add your work experience to autofill job forms
                            faster.
                          </p>
                        </div>
                        <AppVariantButton
                          type="button"
                          size="sm"
                          onClick={AddExperience}
                        >
                          <Plus className="w-4 h-4" />
                          Add Experience
                        </AppVariantButton>
                      </div>
                    )}

                    {experienceFields.map((field, index) => {
                      const isCurrent =
                        experienceValues[index]?.currently_working_on;

                      return (
                        <motion.div
                          key={field.id}
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.15 }}
                          className="rounded-lg border border-border p-4 space-y-3"
                        >
                          <div className="flex flex-col gap-1.5">
                            <label className="text-sm text-muted-foreground">
                              Experience Point
                            </label>
                            <input
                              {...register(
                                `experience.${index}.point` as const,
                              )}
                              className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                              placeholder="e.g. Built and shipped a React dashboard used by 10k users"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-sm text-muted-foreground">
                                Start Date
                              </label>
                              <DatePicker
                                value={
                                  experienceValues[index]?.start_date
                                    ? new Date(
                                        experienceValues[index].start_date,
                                      )
                                    : undefined
                                }
                                onChange={(date) =>
                                  handleStartDateChange(index, date)
                                }
                                placeholder="Start date"
                              />
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <label className="text-sm text-muted-foreground">
                                End Date
                              </label>
                              <DatePicker
                                value={
                                  experienceValues[index]?.end_date
                                    ? new Date(
                                        experienceValues[index].end_date as string,
                                      )
                                    : undefined
                                }
                                onChange={(date) =>
                                  handleEndDateChange(index, date)
                                }
                                placeholder="End date"
                                disabled={isCurrent}
                              />
                            </div>

                            <div className="flex items-center gap-2 h-10">
                              <input
                                type="checkbox"
                                id={`currently-${field.id}`}
                                checked={!!isCurrent}
                                onChange={(e) =>
                                  ToggleCurrentlyWorking(
                                    index,
                                    e.target.checked,
                                  )
                                }
                                className="h-4 w-4 rounded border-input"
                              />
                              <label
                                htmlFor={`currently-${field.id}`}
                                className="text-sm text-muted-foreground"
                              >
                                Currently working
                              </label>
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => removeExperience(index)}
                              className="h-9 w-9 flex items-center justify-center rounded-md border border-input hover:bg-muted transition"
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "rules" && (
              <motion.div
                key="rules"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={transition}
              >
                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="flex items-center justify-between mb-1">
                    <h2 className="text-lg font-semibold">Field Rules</h2>
                    <AppVariantButton type="button" size="sm" onClick={AddItem}>
                      <Plus className="w-4 h-4" />
                      Add Rule
                    </AppVariantButton>
                  </div>

                  <p className="text-xs text-muted-foreground mb-4">
                    Use Ctrl + Enter to add an extra row and Ctrl + Shift +
                    Backspace to delete the current row. Don't add passwords
                    or any other sensitive details here.
                  </p>

                  <div className="space-y-3">
                    {fields.length <= 0 && (
                      <div className="flex flex-col items-center justify-center gap-6 pb-6 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                          <ListPlus className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            No field rules yet
                          </p>
                          <p className="text-sm mt-2 text-muted-foreground">
                            Add a rule to match labels on job forms to your
                            answers.
                          </p>
                        </div>
                        <AppVariantButton
                          type="button"
                          size="sm"
                          onClick={AddItem}
                        >
                          <Plus className="w-4 h-4" />
                          Add Rule
                        </AppVariantButton>
                      </div>
                    )}

                    {fields.length > 0 &&
                      fields.map((field, index) => {
                        const labelError = errors.rules?.[index]?.label;
                        const answerError = errors.rules?.[index]?.answer;

                        return (
                          <motion.div
                            key={field.id}
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.15 }}
                            className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-start"
                          >
                            <div className="flex flex-col gap-1.5">
                              <label className="text-sm text-muted-foreground">
                                Label contains
                              </label>
                              <input
                                {...register(`rules.${index}.label` as const, {
                                  validate: (value) => {
                                    if (!value?.trim()) {
                                      return "Field is required";
                                    }
                                    return true;
                                  },
                                })}
                                className={`h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring ${
                                  labelError
                                    ? "border-destructive"
                                    : "border-input"
                                }`}
                                placeholder="e.g. LinkedIn"
                              />
                              {labelError && (
                                <p className="text-xs text-destructive">
                                  {labelError.message}
                                </p>
                              )}
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <label className="text-sm text-muted-foreground">
                                Answer
                              </label>
                              <input
                                {...register(
                                  `rules.${index}.answer` as const,
                                  {
                                    validate: (value) => {
                                      if (!value?.trim()) {
                                        return "Field is required";
                                      }
                                      return true;
                                    },
                                  },
                                )}
                                className={`h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring ${
                                  answerError
                                    ? "border-destructive"
                                    : "border-input"
                                }`}
                                placeholder="e.g. linkedin.com/in/you"
                              />
                              {answerError && (
                                <p className="text-xs text-destructive">
                                  {answerError.message}
                                </p>
                              )}
                            </div>

                            <div className="grid grid-cols-2 gap-2 sm:flex mt-[26px]">
                              <button
                                type="button"
                                onClick={() => RemoveItem(index)}
                                className="h-10 w-10 flex items-center justify-center rounded-md border border-input hover:bg-muted transition"
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </button>

                              <button
                                type="button"
                                onClick={AddItem}
                                className="h-10 w-10 flex items-center justify-center rounded-md border border-input hover:bg-muted transition"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="sticky bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur py-4 flex justify-end gap-2">
          <AppVariantButton
            type="button"
            onClick={OpenDialog}
            className="h-11 px-4"
          >
            Reset
          </AppVariantButton>

          <AppButton
            type="submit"
            icon={Save}
            isLoading={isPending}
            idleLabel="Save Changes"
            loadingLabel="Saving..."
            successLabel="Saved Successfully!"
            className="h-11 py-0"
          />
        </div>
      </form>

      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset form?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This can't be undone. All fields and rules will be reset to their
            default values.
          </p>
          <DialogFooter className="flex flex-row justify-end gap-2 mt-2">
            <AppVariantButton size="sm" onClick={CloseDialog}>
              Cancel
            </AppVariantButton>
            <AppVariantButton
              variant="danger"
              size="sm"
              onClick={confirmResetForm}
            >
              Reset
            </AppVariantButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}