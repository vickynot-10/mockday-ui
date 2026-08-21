"use client";
import { useState } from "react";
import BreadCrumbs from "@/components/common/Breadcrumbs";
import StatusGridSkeleton from "@/loaders/status.loader";
import Tooltip from "@/components/common/ToolTip";
import {
  useGetStatus,
  useDeleteStatus,
  useSetAsDefault,
  useToggleDashboard,
} from "@/hooks/queries/useStatus";
import { motion, AnimatePresence } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  Star,
  LayoutDashboard,
} from "lucide-react";
import { toast } from "sonner";
import AppVariantButton from "@/components/common/AppVariantButton";
import useDebounce from "@/hooks/app/useDebounce";
import { cn } from "@/lib/utils";
import CreateStatus from "@/components/common/CreateStatus";
import { NoDataFound } from "@/components/common/AppTable";
import AppIconButton from "@/components/common/AppIconButton";

const items = [
  { label: "Settings", isSection: true },
  { label: "Tracker Status" },
];

export default function CustomizableStatus() {
  const [search, setSearch] = useState("");
  const search_term = useDebounce(search, 500);
  const { data, isLoading } = useGetStatus(search_term);
  const {
    mutate: deleteStatus,
    isPending: deleting,
    variables: deletingIds,
  } = useDeleteStatus();
  const {
    mutate: setAsDefault,
    isPending: settingDefault,
    variables: settingDefaultId,
  } = useSetAsDefault();

  const {
    mutate: toggleDashboard,
    isPending: togglingDashboard,
    variables: togglingDashboardId,
  } = useToggleDashboard();

  function isTogglingDashboard(id: string) {
    return togglingDashboard && togglingDashboardId?.id === id;
  }

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);

  const statuses = data?.data ?? [];

  function openCreate() {
    setEditingId(null);
    setOpen(true);
  }

  function openEdit(status: { _id: string; name: string; color: string }) {
    setEditingId(status._id);
    setOpen(true);
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function handleToggleDashboard(
    id: string,
    e: React.MouseEvent,
    currentValue: boolean,
  ) {
    e.stopPropagation();
   toggleDashboard({ id, status: !Boolean(currentValue) });
  }
  function handleChipClick(status: any) {
    if (selectMode) {
      toggleSelect(status._id);
    } else {
      openEdit(status);
    }
  }

  function openDeleteConfirm(ids: string[]) {
    setSelectedIds(ids);
    setConfirmDeleteOpen(true);
  }

  function confirmDelete() {
    deleteStatus(selectedIds, {
      onSuccess: () => {
        setSelectedIds([]);
        setConfirmDeleteOpen(false);
        setSelectMode(false);
      },
    });
  }

  function isRowDeleting(id: string) {
    return deleting && deletingIds?.includes(id);
  }

  function isSettingDefault(id: string) {
    return settingDefault && settingDefaultId === id;
  }

  function handleSetDefault(id: string) {
    setAsDefault(id, {
      onSuccess: (res: any) => {
        if (res.success) {
          toast.success(res?.msg ?? "Default status updated");
        }
      },
    });
  }

  function searchStatus(val: string) {
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
            onChange={(e) => searchStatus(e.target.value)}
            placeholder="Search Status"
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          {selectMode && selectedIds.length > 0 && (
            <AppVariantButton
              variant="danger"
              size="sm"
              className="flex flex-row items-center gap-2"
              onClick={() => openDeleteConfirm(selectedIds)}
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

          <CreateStatus
            open={open}
            onOpenChange={setOpen}
            status={
              editingId ? statuses.find((s: any) => s._id === editingId) : null
            }
            trigger={
              <AppVariantButton
                onClick={openCreate}
                variant="default"
                size="sm"
                className="flex flex-row items-center gap-2"
              >
                <Plus className="w-4 h-4" />
              </AppVariantButton>
            }
          />
        </div>
      </div>

      {isLoading && <StatusGridSkeleton />}

      {!isLoading && statuses.length <= 0 && (
        <NoDataFound text="No Status Found" />
      )}

      {statuses && statuses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnimatePresence initial={false}>
            {statuses.map((status: any) => {
              const isSelected = selectedIds.includes(status._id);
              return (
                <motion.div
                  key={status._id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => handleChipClick(status)}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition-colors overflow-hidden",
                    isSelected
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:bg-accent/50",
                    isRowDeleting(status._id) &&
                      "opacity-50 pointer-events-none",
                  )}
                >
                  <span
                    className="absolute left-0 top-0 h-full w-1.5"
                    style={{ backgroundColor: status.color }}
                  />
                  <span
                    className="w-8 h-8 rounded-lg shrink-0 ml-1"
                    style={{ backgroundColor: status.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-foreground truncate">
                        {status.name}
                      </span>
                      {status.isDefault && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">
                          Default
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground uppercase">
                      {status.color}
                    </span>
                  </div>

                  {!selectMode && (
                    <div className="flex items-center gap-0.5">
                      <AppIconButton
                        size="icon"
                        tooltip="Set as Default"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetDefault(status._id);
                        }}
                        disabled={
                          status.default || isSettingDefault(status._id)
                        }
                        icon={
                          <Star
                            className={cn(
                              status.default && "fill-current text-amber-500",
                            )}
                          />
                        }
                      />

                      <AppIconButton
                        size="icon"
                        tooltip={
                          status.show_in_dashboard
                            ? "Remove from Dashboard"
                            : "Show in Dashboard"
                        }
                        onClick={(e) =>
                          handleToggleDashboard(
                            status._id,
                            e,
                            status.show_in_dashboard,
                          )
                        }
                        disabled={isTogglingDashboard(status._id)}
                        icon={
                          <LayoutDashboard
                            className={cn(
                              status.show_in_dashboard &&
                                "fill-current text-primary",
                            )}
                          />
                        }
                      />

                      <AppIconButton
                        size="icon"
                        tooltip="Edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(status);
                        }}
                        disabled={
                          status.default || isSettingDefault(status._id)
                        }
                        icon={<Pencil />}
                      />

                      <AppIconButton
                        size="icon"
                        tooltip="Delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteConfirm([status._id]);
                        }}
                        disabled={
                          status.default || isSettingDefault(status._id)
                        }
                        icon={<Trash2 className=" text-destructive" />}
                      />
                    </div>
                  )}

                  {selectMode && (
                    <div
                      className={cn(
                        "w-4 h-4 rounded-full border flex items-center justify-center shrink-0",
                        isSelected
                          ? "bg-primary border-primary"
                          : "border-border",
                      )}
                    >
                      {isSelected && (
                        <X className="w-3 h-3 text-primary-foreground" />
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
      <Dialog
        open={confirmDeleteOpen}
        onOpenChange={(v) => !v && setConfirmDeleteOpen(false)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Delete{" "}
              {selectedIds.length > 1
                ? `${selectedIds.length} statuses`
                : "status"}
              ?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This can't be undone. The selected status
            {selectedIds.length > 1 ? "es" : ""} will be permanently removed.
          </p>
          <DialogFooter className="flex flex-row justify-end gap-2 mt-2">
            <AppVariantButton
              variant="default"
              size="sm"
              onClick={() => setConfirmDeleteOpen(false)}
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
