"use client";
import { useState } from "react";
import BreadCrumbs from "@/components/common/Breadcrumbs";
import { useGetStatus, useSaveStatus } from "@/hooks/queries/useStatus";
import { Control, useForm, UseFormSetValue, useWatch } from "react-hook-form";
import { motion, AnimatePresence } from "motion/react";
import { AppButton } from "@/components/common/AppButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import AppVariantButton from "@/components/common/AppVariantButton";

const items = [
  { label: "Settings", isSection: true },
  { label: "Tracker Status" },
];

type StatusForm = {
  name: string;
  color: string;
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

export default function CustomizableStatus() {
  const { data } = useGetStatus();
  const { mutate: saveStatus, isPending } = useSaveStatus();
  const [open, setOpen] = useState(false);
  const [editing_id, setEditingId] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, control } =
    useForm<StatusForm>({
      defaultValues: { name: "", color: "#3B82F6" },
    });

  const statuses = data?.data ?? [];

  const openCreate = () => {
    setEditingId(null);
    reset({ name: "", color: "#3B82F6" });
    setOpen(true);
  };

  const openEdit = (status: { _id: string; name: string; color: string }) => {
    setEditingId(status._id);
    setValue("name", status.name);
    setValue("color", status.color);
    setOpen(true);
  };

  const onSubmit = (values: StatusForm) => {
    saveStatus(
      { _id: editing_id, ...values },
      {
        onSuccess: (res: any) => {
          if (res.success) {
            toast.success(res.msg ?? "Saved Successfully !");

            setOpen(false);
            reset();
          }
        },
      },
    );
  };

  return (
    <>
      <div className="flex items-center justify-between mt-4 mb-4">
        <BreadCrumbs items={items} />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger>
            <AppVariantButton
              onClick={openCreate}
              variant="default"
              size="sm"
              className="flex flex-row items-center gap-2"
            >
              {" "}
              <Plus />{" "}
            </AppVariantButton>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editing_id ? "Edit Status" : "New Status"}
              </DialogTitle>
            </DialogHeader>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
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
                <div className="flex items-center gap-2">
                  <ColorField control={control} setValue={setValue} />
                </div>
              </div>
              <DialogFooter>
                <AppButton
                  type="submit"
                  idleLabel={editing_id ? "Save Changes" : "Create Status"}
                  loadingLabel={editing_id ? "Saving..." : "Creating..."}
                  successLabel={editing_id ? "Saved!" : "Created!"}
                  isLoading={isPending}
                />
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {statuses.map((status: any) => (
            <motion.div
              key={status._id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-between border border-border rounded-lg px-4 py-3 bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: status.color }}
                />
                <span className="text-sm font-medium text-foreground">
                  {status.name}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openEdit(status)}
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
