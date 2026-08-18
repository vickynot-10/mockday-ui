"use client";
import { useFormContext, useFieldArray } from "react-hook-form";
import { motion } from "motion/react";
import { Plus, Trash2, ListPlus } from "lucide-react";
import { useHotkeys } from "react-hotkeys-hook";
import AppVariantButton from "@/components/common/AppVariantButton";
import { FormValues } from "@/types/autofill.types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function RulesTab({ activeTab }: { activeTab: string }) {
  const { register, control, formState: { errors } } = useFormContext<FormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "rules" });

  function AddItem() {
    append({ label: "", answer: "" });
  }

  function RemoveItem(index: number) {
    remove(index);
    requestAnimationFrame(() => {
      const nextInput = document.querySelector<HTMLInputElement>(`input[name="rules.${index}.label"]`);
      nextInput?.focus();
    });
  }

  useHotkeys(
    "ctrl+enter",
    (event) => {
      event.preventDefault();
      if (activeTab !== "rules") return;
      AddItem();
    },
    { enableOnFormTags: ["INPUT"], preventDefault: true },
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
    { enableOnFormTags: ["INPUT"], preventDefault: true },
    [activeTab, fields.length],
  );

  return (
    <>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold">Field Rules</h2>
        <AppVariantButton type="button" size="sm" onClick={AddItem}>
          <Plus className="w-4 h-4" />
          Add Rule
        </AppVariantButton>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        Use Ctrl + Enter to add an extra row and Ctrl + Shift + Backspace to delete the current row. Don't add passwords or any other sensitive details here.
      </p>

      <div className="space-y-3">
        {fields.length <= 0 && (
          <div className="flex flex-col items-center justify-center gap-6 pb-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <ListPlus className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">No field rules yet</p>
              <p className="text-sm mt-2 text-muted-foreground">
                Add a rule to match labels on job forms to your answers.
              </p>
            </div>
            <AppVariantButton type="button" size="sm" onClick={AddItem}>
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
                  <Label className="text-sm text-muted-foreground">Label contains</Label>
                  <Input
                    {...register(`rules.${index}.label` as const, {
                      validate: (value) => (!value?.trim() ? "Field is required" : true),
                    })}
                    className={labelError ? "border-destructive" : ""}
                    placeholder="e.g. LinkedIn"
                  />
                  {labelError && <p className="text-xs text-destructive">{labelError.message}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label className="text-sm text-muted-foreground">Answer</Label>
                  <Input
                    {...register(`rules.${index}.answer` as const, {
                      validate: (value) => (!value?.trim() ? "Field is required" : true),
                    })}
                    className={answerError ? "border-destructive" : ""}
                    placeholder="e.g. linkedin.com/in/you"
                  />
                  {answerError && <p className="text-xs text-destructive">{answerError.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-2 sm:flex mt-[26px]">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => RemoveItem(index)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={AddItem}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
      </div>
    </>
  );
}