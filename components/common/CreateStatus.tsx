"use client";
import { useEffect, useState } from "react";
import { useForm, Control, UseFormSetValue, useWatch } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AppButton } from "@/components/common/AppButton";
import { useSaveStatus } from "@/hooks/queries/useStatus";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { Shuffle } from "lucide-react";
type StatusForm = {
  name: string;
  color: string;
  _id?: string | null;
};

function randomHexColor(dark: boolean) {
  const min = dark ? 0 : 150;
  const max = dark ? 100 : 255;
  const r = Math.floor(Math.random() * (max - min) + min);
  const g = Math.floor(Math.random() * (max - min) + min);
  const b = Math.floor(Math.random() * (max - min) + min);
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

function generateSwatches() {
  const dark = Array.from({ length: 3 }, () => randomHexColor(true));
  const light = Array.from({ length: 3 }, () => randomHexColor(false));
  return [...dark, ...light];
}

function ColorField({
  control,
  setValue,
}: {
  control: Control<StatusForm>;
  setValue: UseFormSetValue<StatusForm>;
}) {
  const colorValue = useWatch({ control, name: "color" });
  const [swatches, setSwatches] = useState(generateSwatches);

  function applyColor(color: string) {
    setValue("color", color, { shouldDirty: true });
  }

  function handleRandomClick() {
    setSwatches(generateSwatches());
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <input
          id="color"
          type="color"
          className="w-10 h-9 rounded-md border border-border cursor-pointer bg-transparent"
          value={colorValue}
          onChange={(e) => applyColor(e.target.value)}
        />
        <Input
          value={colorValue}
          onChange={(e) => applyColor(e.target.value)}
          className="flex-1"
        />
      </div>
      <div className="flex items-center gap-2">
        <AnimatePresence mode="popLayout">
          {swatches.map((swatch, index) => (
            <motion.button
              key={swatch + index}
              type="button"
              onClick={() => applyColor(swatch)}
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                backgroundColor: swatch,
                transition: { duration: 0.3, delay: index * 0.04 },
              }}
              exit={{ scale: 0, opacity: 0 }}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              className="w-7 h-7 rounded-full border-2"
              style={{
                borderColor:
                  colorValue === swatch ? "var(--foreground)" : "transparent",
              }}
            />
          ))}
        </AnimatePresence>
        <motion.button
          type="button"
          onClick={handleRandomClick}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{ rotate: [0, 90, 0] }}
          transition={{ duration: 0.01 }}
          className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-muted-foreground"
        >
          <Shuffle size={14} />
        </motion.button>
      </div>
    </div>
  );
}

export default function CreateStatus({
  status,
  trigger,
  open,
  onOpenChange,
  onSaved,
}: {
  status?: { _id: string; name: string; color: string } | null;
  trigger?: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
}) {
  const editingId = status?._id ?? null;

  const { register, handleSubmit, reset, setValue, control } =
    useForm<StatusForm>({
      defaultValues: { name: "", color: "#3B82F6" },
    });

  const { mutate: saveStatus, isPending } = useSaveStatus();

  useEffect(() => {
    if (!open) return;
    if (status) {
      setValue("name", status.name);
      setValue("color", status.color);
    } else {
      reset({ name: "", color: "#3B82F6" });
    }
  }, [open, status]);

  function onSubmit(values: StatusForm) {
    if (editingId) {
      values._id = editingId;
    } else {
      delete values._id;
    }
    saveStatus(values, {
      onSuccess: (res: any) => {
        if (res.success) {
          toast.success(res.msg ?? "Saved Successfully !");
          onOpenChange(false);
          onSaved?.();
        }
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger>{trigger}</DialogTrigger>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingId ? "Edit Status" : "New Status"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g. Interview"
              {...register("name", { required: true })}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="color">Color</Label>
            <ColorField control={control} setValue={setValue} />
          </div>
          <DialogFooter>
            <AppButton
              type="submit"
              idleLabel={editingId ? "Save Changes" : "Create Status"}
              loadingLabel={editingId ? "Saving..." : "Creating..."}
              successLabel={editingId ? "Saved!" : "Created!"}
              isLoading={isPending}
            />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
