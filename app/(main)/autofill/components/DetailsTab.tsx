"use client";
import { useEffect, useRef, useState } from "react";
import { useFormContext, useFieldArray, useWatch } from "react-hook-form";
import { motion } from "motion/react";
import { Plus, Trash2, X, ListPlus } from "lucide-react";
import AppVariantButton from "@/components/common/AppVariantButton";
import { FormValues } from "@/types/autofill.types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function normalizeToken(raw: string) {
  return raw.trim().toLowerCase().replace(/\s+/g, "_");
}

function ChipsInput({
  values,
  onChange,
  placeholder,
}: {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");

  function commitDraft() {
    const normalized = normalizeToken(draft);
    if (!normalized) return;
    if (values.includes(normalized)) {
      setDraft("");
      return;
    }
    onChange([...values, normalized]);
    setDraft("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commitDraft();
      return;
    }
    if (e.key === "Backspace" && draft === "" && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  }

  function removeChip(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-md border border-input px-2 py-1.5 min-h-10 focus-within:ring-1 focus-within:ring-ring">
      {values.map((chip, index) => (
        <span
          key={`${chip}-${index}`}
          className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs"
        >
          {chip}
          <button
            type="button"
            onClick={() => removeChip(index)}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commitDraft}
        placeholder={values.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[80px] bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}

function CustomFieldRow({
  index,
  control,
  register,
  setValue,
  labelRefs,
  onKeyDownLabel,
  onRemove,
}: {
  index: number;
  control: any;
  register: any;
  setValue: any;
  labelRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  onKeyDownLabel: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}) {
  const values =
    useWatch({ control, name: `custom_rules.${index}.values` }) || [];
  const {
    ref: labelRegisterRef,
    onBlur: labelRegisterOnBlur,
    ...labelRegisterProps
  } = register(`custom_rules.${index}.label` as const);

  function handleLabelBlur(e: React.FocusEvent<HTMLInputElement>) {
    labelRegisterOnBlur(e);
    setValue(`custom_rules.${index}.label`, normalizeToken(e.target.value), {
      shouldDirty: true,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="rounded-lg border border-border p-4 space-y-3"
    >
      <div className=" grid grid-cols-2 items-center justify-between">
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm text-muted-foreground">Label</Label>
          <Input
            {...labelRegisterProps}
            ref={(node) => {
              labelRegisterRef(node);
              labelRefs.current[index] = node;
            }}
            onBlur={handleLabelBlur}
            onKeyDown={onKeyDownLabel}
            placeholder="e.g. How Did You Hear About Us?"
          />
        </div>
        <div className="flex justify-end flex-row items-center gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onRemove}
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onRemove}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      </div>

    
        <div className="flex flex-col gap-1.5">
          <Label className="text-sm text-muted-foreground">
            Possible Answers
          </Label>
          <ChipsInput
            values={values}
            onChange={(next) =>
              setValue(`custom_rules.${index}.values`, next, {
                shouldDirty: true,
              })
            }
            placeholder="Type an answer and press Enter"
          />
        </div>
     
    </motion.div>
  );
}

export default function CustomFieldsTab() {
  const { register, control, setValue } = useFormContext<FormValues>();

  const {
    fields: customFields,
    append: appendCustomField,
    remove: removeCustomField,
  } = useFieldArray({ control, name: "custom_rules" });

  const labelRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [scrollToIndex, setScrollToIndex] = useState<number | null>(null);

  useEffect(() => {
    if (scrollToIndex === null) return;
    const node = labelRefs.current[scrollToIndex];
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
      node.focus();
    }
    setScrollToIndex(null);
  }, [scrollToIndex, customFields.length]);

  function AddCustomField() {
    const nextIndex = customFields.length;
    appendCustomField({ label: "", values: [] });
    setScrollToIndex(nextIndex);
  }

  function handleLabelKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.ctrlKey && e.key === "Enter") {
      e.preventDefault();
      AddCustomField();
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-semibold">Field Rules</h2>
        <AppVariantButton type="button" size="sm" onClick={AddCustomField}>
          <Plus className="w-4 h-4" />
          Add Field
        </AppVariantButton>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        Add rules for fields the defaults above don't cover — like "How Did You
        Hear About Us?". For each label, add one or more possible answers in
        priority order; the extension fills the first match it finds on the
        page.
      </p>

      <div className="space-y-4">
        {customFields.length <= 0 && (
          <div className="flex flex-col items-center justify-center gap-6 pb-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <ListPlus className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">No field rules added yet</p>
              <p className="text-sm mt-2 text-muted-foreground">
                Add a label and possible answers to autofill fields the defaults
                miss.
              </p>
            </div>
            <AppVariantButton type="button" size="sm" onClick={AddCustomField}>
              <Plus className="w-4 h-4" />
              Add Field
            </AppVariantButton>
          </div>
        )}

        {customFields.map((field, index) => (
          <CustomFieldRow
            key={field.id}
            index={index}
            control={control}
            register={register}
            setValue={setValue}
            labelRefs={labelRefs}
            onKeyDownLabel={handleLabelKeyDown}
            onRemove={() => removeCustomField(index)}
          />
        ))}
      </div>
    </div>
  );
}
