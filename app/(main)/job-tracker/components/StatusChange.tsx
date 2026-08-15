"use client";
import { useState } from "react";
import { useGetAllStatus } from "@/hooks/queries/useStatus";
import CreateStatus from "@/components/common/CreateStatus";
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

type EditProps = {
  id: string;
  status: string;
};

export default function StatusMenu({ id, status }: EditProps) {
  const { data } = useGetAllStatus();
  const [openCreate, setOpenCreate] = useState(false);
  const statuses = data?.data ?? [];

  const { mutate } = useUpdateStatusTrackers();

  function handleSelect(status_id: string) {
    if (!status_id || !id) return;
    mutate({ status_id, tracker_id: id });
  }

  function handleAddStatusClick() {
    setOpenCreate(true);
  }

  return (
    <>
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
            {statuses.map((item: any) => (
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
              onClick={handleAddStatusClick}
              className="flex items-center gap-2 text-primary"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Status
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateStatus open={openCreate} onOpenChange={setOpenCreate} />
    </>
  );
}
