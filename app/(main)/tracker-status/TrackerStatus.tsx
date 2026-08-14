"use client";
import { useState } from "react";
import BreadCrumbs from "@/components/common/Breadcrumbs";
import {
  useGetStatus,
  useSaveStatus,
  useDeleteStatus,
} from "@/hooks/queries/useStatus";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";
import { toast } from "sonner";
import AppVariantButton from "@/components/common/AppVariantButton";
import useDebounce from "@/hooks/app/useDebounce";
import { cn } from "@/lib/utils";

const items = [
  { label: "Settings", isSection: true },
  { label: "Tracker Status" },
];

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

export default function CustomizableStatus() {
  const [search, setSearch] = useState("");
  const search_term = useDebounce(search, 500);
  const { data } = useGetStatus(search_term);
  const { mutate: saveStatus, isPending } = useSaveStatus();
  const {
    mutate: deleteStatus,
    isPending: deleting,
    variables: deletingIds,
  } = useDeleteStatus();

  const [open, setOpen] = useState(false);
  const [editing_id, setEditingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);

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
    if (editing_id) {
      values._id = editing_id;
    } else {
      delete values._id;
    }
    saveStatus(values, {
      onSuccess: (res: any) => {
        if (res.success) {
          toast.success(res.msg ?? "Saved Successfully !");
          setOpen(false);
          reset();
        }
      },
    });
  };

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function handleChipClick(status: any) {
    if (selectMode) {
      toggleSelect(status._id);
    } else {
      openEdit(status);
    }
  }

  function confirmDelete() {
    deleteStatus(deleteTargetIds, {
      onSuccess: () => {
        setSelectedIds((prev) =>
          prev.filter((id) => !deleteTargetIds.includes(id)),
        );
        setDeleteTargetIds([]);
      },
    });
  }

  function isRowDeleting(id: string) {
    return deleting && deletingIds?.includes(id);
  }

  function Searchstatus(val: string) {
    setSearch(val);
    setSelectedIds([]);
  }

  return (
    <>
      <BreadCrumbs items={items} />
      <div className="flex items-center justify-between my-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            value={search}
            onChange={(e) => Searchstatus(e.target.value)}
            placeholder="Search Status"
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <AppVariantButton
              variant="danger"
              size="sm"
              className="flex flex-row items-center gap-2"
              onClick={() => setDeleteTargetIds(selectedIds)}
            >
              <Trash2 className="w-4 h-4" />
              Delete {selectedIds.length} selected
            </AppVariantButton>
          )}

          {statuses.length > 0 && (
            <AppVariantButton
              variant={selectMode ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectMode((prev) => !prev);
                setSelectedIds([]);
              }}
            >
              {selectMode ? "Done" : "Select"}
            </AppVariantButton>
          )}

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger>
              <AppVariantButton
                onClick={openCreate}
                variant="default"
                size="sm"
                className="flex flex-row items-center gap-2"
              >
                <Plus className="w-4 h-4" />
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
                  <ColorField control={control} setValue={setValue} />
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
      </div>

      <div className="flex flex-wrap gap-2.5">
        <AnimatePresence initial={false}>
          {statuses.map((status: any) => {
            const isSelected = selectedIds.includes(status._id);
            return (
              <motion.div
                key={status._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                onClick={() => handleChipClick(status)}
                className={cn(
                  "group flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-full border cursor-pointer transition-colors",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:bg-accent/50",
                  isRowDeleting(status._id) && "opacity-50 pointer-events-none",
                )}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: status.color }}
                />
                <span className="text-sm font-medium text-foreground">
                  {status.name}
                </span>

                {!selectMode && (
                  <div className="flex items-center gap-0.5 ml-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(status);
                      }}
                      className="p-1 rounded-full hover:bg-background"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTargetIds([status._id]);
                      }}
                      className="p-1 rounded-full hover:bg-background"
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </button>
                  </div>
                )}

                {selectMode && isSelected && (
                  <X className="w-3 h-3 ml-1" />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {statuses.length === 0 && (
          <p className="text-sm text-muted-foreground py-2">No statuses found</p>
        )}
      </div>

      <Dialog
        open={deleteTargetIds.length > 0}
        onOpenChange={(v) => !v && setDeleteTargetIds([])}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Delete{" "}
              {deleteTargetIds.length > 1
                ? `${deleteTargetIds.length} statuses`
                : "status"}
              ?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This can't be undone. The selected status
            {deleteTargetIds.length > 1 ? "es" : ""} will be permanently
            removed.
          </p>
          <DialogFooter className="flex flex-row justify-end gap-2 mt-2">
            <AppVariantButton
              variant="default"
              size="sm"
              onClick={() => setDeleteTargetIds([])}
              disabled={deleting}
            >
              Cancel
            </AppVariantButton>
            <AppVariantButton
              variant="danger"
              size="sm"
              onClick={confirmDelete}
              disabled={deleting}
              isLoading={deleting}
            >
              Delete
            </AppVariantButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}