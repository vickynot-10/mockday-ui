"use client";
import { useEffect } from "react";
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

type StatusForm = {
  name: string;
  color: string;
  _id?: string | null;
};

function ColorField({
  control,
  setValue,
}: {
  control: Control<StatusForm>;
  setValue: UseFormSetValue<StatusForm>;
}) {
  const colorValue = useWatch({ control, name: "color" });

  return (
    <div className="flex items-center gap-2">
      <input
        id="color"
        type="color"
        className="w-10 h-9 rounded-md border border-border cursor-pointer bg-transparent"
        value={colorValue}
        onChange={(e) =>
          setValue("color", e.target.value, { shouldDirty: true })
        }
      />
      <Input
        value={colorValue}
        onChange={(e) =>
          setValue("color", e.target.value, { shouldDirty: true })
        }
        className="flex-1"
      />
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
