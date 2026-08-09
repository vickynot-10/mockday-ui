"use client";
import BreadCrumbs from "@/components/common/Breadcrumbs";
import { useForm, useFieldArray } from "react-hook-form";
import { motion } from "motion/react";
import { Plus, Trash2, Save, ListPlus } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { JellyButton } from "@/components/godui/jelly-button";

const items = [{ label: "AutoFills" }];

type FieldRule = {
  label: string;
  answer: string;
};

type FormValues = {
  name: string;
  email: string;
  phone: string;
  rules: FieldRule[];
};

export default function AutoFill() {
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const { register, control, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      rules: [{ label: "", answer: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "rules",
  });
  function CloseDialog() {
    setResetDialogOpen(false);
  }

  function OpenDialog() {
    setResetDialogOpen(true);
  }
  function AddItem() {
    append({ label: "", answer: "" });
  }

  function RemoveItem(index: number) {
    remove(index);
  }

  const confirmResetForm = () => {
    reset();
    setResetDialogOpen(false);
  };

  const onSubmit = (data: FormValues) => {
    console.log(data);
  };

  return (
    <>
      <BreadCrumbs items={items} />

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
        <div className="space-y-8 pb-24">
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Default Fields</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm text-muted-foreground">Name</label>
                <input
                  {...register("name")}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  placeholder="John Doe"
                />
              </div>

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

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
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
                fields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-end"
                  >
                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm text-muted-foreground">
                        Label contains
                      </label>
                      <input
                        {...register(`rules.${index}.label` as const)}
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        placeholder="e.g. LinkedIn"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-sm text-muted-foreground">
                        Answer
                      </label>
                      <input
                        {...register(`rules.${index}.answer` as const)}
                        className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                        placeholder="e.g. linkedin.com/in/you"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:flex">
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
                ))}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur py-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={OpenDialog}
            className="inline-flex items-center gap-1.5 rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-muted transition"
          >
            Reset
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:opacity-90 transition"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
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
