"use client";
import BreadCrumbs from "@/components/common/Breadcrumbs";
import { useForm, useFieldArray } from "react-hook-form";
import { motion } from "motion/react";
import { Plus, Trash2, Save, ListPlus, Loader2 } from "lucide-react";
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
import { JellyButton } from "@/components/godui/jelly-button";
import { useGetAutoFill, useSaveAutoFill } from "@/hooks/queries/useAutofills";

const items = [{ label: "Apps", isSection: true }, { label: "Autofills" }];

type FieldRule = {
  label: string;
  answer: string;
};

type FormValues = {
  email: string;
  phone: string;
  rules: FieldRule[];
};

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
  const { isLoading, data } = useGetAutoFill();
  const { mutate, isPending } = useSaveAutoFill();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      email: "",
      phone: "",
      rules: [{ label: "", answer: "" }],
    },
  });

  const hasHydrated = useRef(false);
  const { fields, append, remove } = useFieldArray({
    control,
    name: "rules",
  });

  useEffect(() => {
    if (!data || !data?.data || hasHydrated.current) return;
    hasHydrated.current = true;
    const { email, phone, _id, created_on, updated_on, ...rest } = data.data;

    const rules = Object.entries(rest).map(([label, answer]) => ({
      label,
      answer: answer as string,
    }));

    reset({
      email: email ?? "",
      phone: phone ?? "",
      rules: rules.length > 0 ? rules : [{ label: "", answer: "" }],
    });
  }, [data, reset]);

  useHotkeys(
    "ctrl+enter",
    (event) => {
      event.preventDefault();
      AddItem();
    },
    {
      enableOnFormTags: ["INPUT"],
      preventDefault: true,
    },
  );

  useHotkeys(
    "ctrl+shift+backspace",
    (event) => {
      event.preventDefault();
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

    const payload = {
      email: data.email.trim(),
      phone: data.phone.trim(),
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
        <div className="space-y-8 pb-24">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Default Fields</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-muted-foreground">Email</label>
                <input
                  {...register("email")}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="john@example.com"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-muted-foreground">Phone</label>
                <input
                  {...register("phone")}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border  border-border bg-card p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-semibold">Field Rules</h2>
              <button
                type="button"
                onClick={AddItem}
                className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm hover:opacity-90 transition"
              >
                <Plus className="w-4 h-4" />
                Add Rule
              </button>
            </div>

            <p className="text-xs text-muted-foreground mb-4">
              Use Ctrl + Enter to add an extra row and Ctrl + Shift + Backspace
              to delete the current row. Don't add passwords or any other
              sensitive details here.
            </p>

            <div className="space-y-3">
              {fields.length <= 0 && (
                <div className="flex flex-col items-center justify-center gap-6  pb-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <ListPlus className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">No field rules yet</p>
                    <p className="text-sm mt-2 text-muted-foreground">
                      Add a rule to match labels on job forms to your answers.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={AddItem}
                    className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 py-1.5 text-sm hover:opacity-90 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add Rule
                  </button>
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
                            labelError ? "border-destructive" : "border-input"
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
                          {...register(`rules.${index}.answer` as const, {
                            validate: (value) => {
                              if (!value?.trim()) {
                                return "Field is required";
                              }
                              return true;
                            },
                          })}
                          className={`h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring ${
                            answerError ? "border-destructive" : "border-input"
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
        </div>

        <div className="sticky bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur py-4 flex justify-end gap-2">
          <JellyButton type="button" onClick={OpenDialog} variant="secondary">
            Reset
          </JellyButton>

          <JellyButton type="submit" disabled={isPending}>
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4 me-2" />
            )}
            {isPending ? "Saving..." : "Save Changes"}
          </JellyButton>
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
            <JellyButton variant="outline" size="sm" onClick={CloseDialog}>
              Cancel
            </JellyButton>
            <JellyButton
              variant="destructive"
              size="sm"
              onClick={confirmResetForm}
            >
              Reset
            </JellyButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
