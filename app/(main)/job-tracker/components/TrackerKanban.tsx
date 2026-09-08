"use client";
import { ComponentProps, useEffect, useState } from "react";
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanItem,
  KanbanItemHandle,
  KanbanOverlay,
  type KanbanCommitMeta,
} from "@/components/reui/kanban";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import AppVariantButton from "@/components/common/AppVariantButton";
import AddReminder from "./AddReminder";
import { Pencil, Trash2, BellPlus, EllipsisVertical } from "lucide-react";
import {
  useGetTrackers,
  useUpdateStatusTrackers,
  useDeleteTrackers,
} from "@/hooks/queries/useTrackers";
import type { TrackerStatus } from "../JobTracker";
import JobTrackerKanbanSkeleton from "@/loaders/tracker-kanban.loader";

const EMPTY_OBJECT: Record<string, TrackerCard[]> = {};

type TrackerCard = {
  _id: string;
  company: string;
  image?: string;
  title: string;
  site_name: string;
  url: string;
  applied_on: string;
  status?: string;
  status_result?: TrackerStatus;
};

type Filters = {
  sort: string;
  search: string;
  status?: string;
  from?: string;
  to?: string;
};

type Props = {
  filters: Filters;
  statuses: TrackerStatus[];
};

interface TrackerCardProps
  extends Omit<ComponentProps<typeof KanbanItem>, "value" | "children"> {
  item: TrackerCard;
  asHandle?: boolean;
  isOverlay?: boolean;
  onEdit?: (id: string) => void;
  onRemind?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function TrackerItemCard({
  item,
  asHandle,
  isOverlay,
  onEdit,
  onRemind,
  onDelete,
  ...props
}: TrackerCardProps) {
  const cardContent = (
    <div className="group/card relative rounded-xl border bg-card p-3.5 flex items-center gap-3">
      {!isOverlay && (
        <DropdownMenu>
          <DropdownMenuTrigger onPointerDown={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="shrink-0 p-1 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground opacity-0 group-hover/card:opacity-100 transition-opacity"
            >
              <EllipsisVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40">
            <DropdownMenuItem onClick={() => onEdit?.(item._id)}>
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onRemind?.(item._id)}>
              <BellPlus className="w-3.5 h-3.5" />
              <span>Add Reminder</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete?.(item._id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <span className="text-xs text-muted-foreground line-clamp-1">
          {item.company}
        </span>
        <span className="text-sm font-semibold text-foreground/90 line-clamp-1">
          {item.title || "Untitled"}
        </span>
        {item.applied_on && (
          <time className="text-[11px] text-muted-foreground tabular-nums">
            {new Date(item.applied_on).toLocaleDateString("en-US", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </time>
        )}
      </div>

      {item.image && (
        <span className="size-9 rounded-full bg-background flex items-center justify-center overflow-hidden shrink-0">
          <img
            src={item.image}
            alt={item.company}
            className="size-5 object-contain"
            onError={(e) => {
              e.currentTarget.parentElement!.style.display = "none";
            }}
          />
        </span>
      )}
    </div>
  );

  return (
    <KanbanItem value={item._id} {...props}>
      {asHandle && !isOverlay ? (
        <KanbanItemHandle>{cardContent}</KanbanItemHandle>
      ) : (
        cardContent
      )}
    </KanbanItem>
  );
}

interface TrackerColumnProps
  extends Omit<ComponentProps<typeof KanbanColumn>, "children"> {
  label: string;
  items: TrackerCard[];
  isOverlay?: boolean;
  onEdit?: (id: string) => void;
  onRemind?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function TrackerStatusColumn({
  value,
  label,
  items,
  isOverlay,
  onEdit,
  onRemind,
  onDelete,
  ...props
}: TrackerColumnProps) {
  return (
    <KanbanColumn
      value={value}
      {...props}
      className="flex flex-col min-h-0 w-80 shrink-0"
    >
      <div className="flex items-center justify-between mb-3 px-1 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{label}</span>
          <Badge
            variant="outline"
            className="rounded-full size-5 p-0 flex items-center justify-center text-[11px]"
          >
            {items.length}
          </Badge>
        </div>
      </div>

      <KanbanColumnContent
        value={value}
        className="flex flex-col gap-2.5 overflow-y-auto thin-scrollbar pr-1 max-h-[calc(100vh-320px)]"
      >
        {items.map((item) => (
          <TrackerItemCard
            key={item._id}
            item={item}
            asHandle={!isOverlay}
            onEdit={onEdit}
            onRemind={onRemind}
            onDelete={onDelete}
          />
        ))}
      </KanbanColumnContent>
    </KanbanColumn>
  );
}

export default function JobTrackerKanbanView({ filters, statuses }: Props) {
  const { data, isLoading } = useGetTrackers({
    page: 1,
    limit: 500,
    ...filters,
    type: "kanban",
  });
  const { mutate: updateStatus } = useUpdateStatusTrackers();
  const { mutate: deleteTrackers, isPending: deleting } = useDeleteTrackers();

  const docs: Record<string, TrackerCard[]> = data?.data?.docs ?? EMPTY_OBJECT;
  const [columns, setColumns] = useState<Record<string, TrackerCard[]>>({});

  const [reminderTrackerId, setReminderTrackerId] = useState<string | null>(null);
  const [openReminders, setOpenReminders] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    setColumns(docs);
  }, [data]);

  function getStatusIdForColumn(columnKey: string) {
    if (columnKey === "NA") return null;
    return statuses.find((s) => s.name === columnKey)?._id ?? null;
  }

  function handleValueChange(next: Record<string, TrackerCard[]>) {
    setColumns(next);
  }

  function handleValueCommit(
    _value: Record<string, TrackerCard[]>,
    meta: KanbanCommitMeta<TrackerCard>
  ) {
    if (meta.kind !== "item") return;

    const trackerId = String(meta.event.active.id);

    updateStatus({
      status_id: getStatusIdForColumn(meta.overContainer),
      tracker_id: trackerId,
    });
  }

  function handleEdit(id: string) {
    window.location.href = `/job-tracker/edit/${id}`;
  }

  function handleRemind(id: string) {
    setReminderTrackerId(id);
    setOpenReminders(true);
  }

  function confirmDelete() {
    if (!deleteTargetId) return;
    deleteTrackers([deleteTargetId], {
      onSuccess: () => setDeleteTargetId(null),
    });
  }

  if (isLoading) {
    return <JobTrackerKanbanSkeleton />
  }

  const columnKeys = Object.keys(columns);

  return (
    <>
      <Kanban
        value={columns}
        onValueChange={handleValueChange}
        onValueCommit={handleValueCommit}
        getItemValue={(item) => item._id}
      >
        <KanbanBoard className="flex gap-4 overflow-x-auto pb-2 thin-scrollbar">
          {columnKeys.map((key) => (
            <TrackerStatusColumn
              key={key}
              value={key}
              label={key}
              items={columns[key] ?? []}
              onEdit={handleEdit}
              onRemind={handleRemind}
              onDelete={(id) => setDeleteTargetId(id)}
            />
          ))}
        </KanbanBoard>

        <KanbanOverlay>
          {({ value, variant }) => {
            if (variant === "column") {
              const key = String(value);
              const items = columns[key] ?? [];
              return <TrackerStatusColumn value={key} label={key} items={items} isOverlay />;
            }

            const item = Object.values(columns)
              .flat()
              .find((item) => item._id === value);

            if (!item) return null;

            return <TrackerItemCard item={item} isOverlay />;
          }}
        </KanbanOverlay>
      </Kanban>

      {reminderTrackerId && (
        <AddReminder
          trackerId={reminderTrackerId}
          open={openReminders}
          onOpenChange={setOpenReminders}
        />
      )}

      <Dialog open={!!deleteTargetId} onOpenChange={(v) => !v && setDeleteTargetId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete tracker?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This can't be undone. The selected tracker will be permanently removed.
          </p>
          <DialogFooter className="flex flex-row justify-end gap-2 mt-2">
            <AppVariantButton
              variant="default"
              size="sm"
              onClick={() => setDeleteTargetId(null)}
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