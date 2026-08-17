"use client";
import { useFormContext, useFieldArray } from "react-hook-form";
import { motion } from "motion/react";
import { Plus, Trash2, ListPlus } from "lucide-react";
import { format } from "date-fns";
import AppVariantButton from "@/components/common/AppVariantButton";
import DatePicker from "./DatePicker";
import { FormValues } from "@/types/autofill.types";

export default function DetailsTab() {
  const { register, control, watch, setValue } = useFormContext<FormValues>();

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
  } = useFieldArray({ control, name: "experience" });

  const experienceValues = watch("experience") || [];

  function AddExperience() {
    appendExperience({
      point: "",
      start_date: "",
      end_date: "",
      currently_working_on: false,
    });
  }

  function ToggleCurrentlyWorking(index: number, checked: boolean) {
    setValue(`experience.${index}.currently_working_on`, checked, { shouldDirty: true });
    setValue(`experience.${index}.end_date`, checked ? null : "", { shouldDirty: true });
  }

  function handleStartDateChange(index: number, date: Date | undefined) {
    setValue(`experience.${index}.start_date`, date ? format(date, "yyyy-MM-dd") : "", { shouldDirty: true });
  }

  function handleEndDateChange(index: number, date: Date | undefined) {
    setValue(`experience.${index}.end_date`, date ? format(date, "yyyy-MM-dd") : "", { shouldDirty: true });
  }

  return (
    <>
      <div >
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

      <div>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold">Experience</h2>
          <AppVariantButton type="button" size="sm" onClick={AddExperience}>
            <Plus className="w-4 h-4" />
            Add Experience
          </AppVariantButton>
        </div>

        <p className="text-xs text-muted-foreground mb-4">
          Add your work experience points. Toggle "Currently working" to leave the end date empty.
        </p>

        <div className="space-y-4">
          {experienceFields.length <= 0 && (
            <div className="flex flex-col items-center justify-center gap-6 pb-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <ListPlus className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">No experience added yet</p>
                <p className="text-sm mt-2 text-muted-foreground">
                  Add your work experience to autofill job forms faster.
                </p>
              </div>
              <AppVariantButton type="button" size="sm" onClick={AddExperience}>
                <Plus className="w-4 h-4" />
                Add Experience
              </AppVariantButton>
            </div>
          )}

          {experienceFields.map((field, index) => {
            const isCurrent = experienceValues[index]?.currently_working_on;
            return (
              <motion.div
                key={field.id}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="rounded-lg border border-border p-4 space-y-3"
              >
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm text-muted-foreground">Experience Point</label>
                  <input
                    {...register(`experience.${index}.point` as const)}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                    placeholder="e.g. Built and shipped a React dashboard used by 10k users"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-muted-foreground">Start Date</label>
                    <DatePicker
                      value={experienceValues[index]?.start_date ? new Date(experienceValues[index].start_date) : undefined}
                      onChange={(date) => handleStartDateChange(index, date)}
                      placeholder="Start date"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm text-muted-foreground">End Date</label>
                    <DatePicker
                      value={experienceValues[index]?.end_date ? new Date(experienceValues[index].end_date as string) : undefined}
                      onChange={(date) => handleEndDateChange(index, date)}
                      placeholder="End date"
                      disabled={isCurrent}
                    />
                  </div>

                  <div className="flex items-center gap-2 h-10">
                    <input
                      type="checkbox"
                      id={`currently-${field.id}`}
                      checked={!!isCurrent}
                      onChange={(e) => ToggleCurrentlyWorking(index, e.target.checked)}
                      className="h-4 w-4 rounded border-input"
                    />
                    <label htmlFor={`currently-${field.id}`} className="text-sm text-muted-foreground">
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
    </>
  );
}