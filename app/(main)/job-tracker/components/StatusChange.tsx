"use client";
import { useUpdateStatusTrackers } from "@/hooks/queries/useTrackers";
import AppIconButton from "@/components/common/AppIconButton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Plus, EllipsisVertical } from "lucide-react";
import { cn } from "@/lib/utils";

type TrackerStatus = {
  _id: string;
  name: string;
  color: string;
};

type StatusMenuProps = {
  id: string;
  status: string;
  statuses: TrackerStatus[];
  onAddStatus: () => void;
};

export default function StatusMenu({
  id,
  status,
  statuses,
  onAddStatus,
}: StatusMenuProps) {
  const { mutate } = useUpdateStatusTrackers();

  function handleSelect(status_id: string) {
    if (!status_id || !id) return;
    mutate({ status_id, tracker_id: id });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <AppIconButton
          icon={<EllipsisVertical />}
          tooltip="Change Status"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 p-0">
        <div className="max-h-56 overflow-y-auto p-1">
          {statuses.map((item) => (
            <DropdownMenuItem
              key={item._id}
              onClick={() => handleSelect(item._id)}
              className={cn(
                "flex items-center gap-2",
                item._id === status && "bg-accent/40",
              )}
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate">{item.name}</span>
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuSeparator className="mx-0" />

        <div className="p-1">
          <DropdownMenuItem
            onClick={onAddStatus}
            className="flex items-center gap-2 text-primary"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Status
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}