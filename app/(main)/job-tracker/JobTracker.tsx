"use client";
import BreadCrumbs from "@/components/common/Breadcrumbs";
import useDebounce from "@/hooks/app/useDebounce";
import { FilterBar } from "@/components/godui/filter-bar";
import AppliedDateFilter from "@/components/common/DatePicker";
import { useTrackerFilters } from "@/hooks/filters/useTrackerFilters";
import { ArrowUpDown, BellPlus } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import AppVariantButton from "@/components/common/AppVariantButton";
import {
  useGetTrackers,
  useUpdateStatusTrackers,
  useDeleteTrackers,
} from "@/hooks/queries/useTrackers";
import { useGetAllStatus } from "@/hooks/queries/useStatus";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  EllipsisVertical,
  X,
} from "lucide-react";
import { formatDateTime } from "@/utils/formatDateTime";
import {
  AppTable,
  AppTableColumn,
  AppTablePageInfo,
} from "@/components/common/AppTable";
import { Badge } from "@/components/ui/badge";
import AppIconButton from "@/components/common/AppIconButton";
import { cn } from "@/lib/utils";
import CreateStatus from "@/components/common/CreateStatus";
import AddReminder from "./components/AddReminder";

const EMPTY_ARRAY: never[] = [];
const items = [{ label: "Apps", isSection: true }, { label: "Trackers" }];

type TrackerStatus = {
  _id: string;
  name: string;
  color: string;
};

type TrackerRow = {
  _id: string;
  company: string;
  url: string;
  image: string;
  site_name: string;
  applied_on: string;
  status: string;
  status_result: TrackerStatus;
};

export default function JobTracker() {
  const [search, setSearch] = useState("");
  const search_term = useDebounce(search, 500);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openReminders, setOpenReminders] = useState<boolean>(false);
  const [reminderTrackerId, setReminderTrackerId] = useState<string | null>(
    null,
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);

  const { mutate } = useUpdateStatusTrackers();
  const { mutate: deleteTrackers, isPending: deleting } = useDeleteTrackers();

  function handleSelect(status_id: string | null, tracker_id: string) {
    if (!tracker_id) return;
    mutate({ status_id, tracker_id: tracker_id });
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function toggleSelectAll() {
  const pageIds = rows.map((r: TrackerRow) => r._id);
  const allSelected =
    pageIds.length > 0 && pageIds.every((id :any) => selectedIds.includes(id));

  setSelectedIds((prev) =>
    allSelected
      ? prev.filter((id) => !pageIds.includes(id))
      : [...new Set([...prev, ...pageIds])],
  );
}

  function confirmDelete() {
    deleteTrackers(deleteTargetIds, {
      onSuccess: () => {
        setSelectedIds((prev) =>
          prev.filter((id) => !deleteTargetIds.includes(id)),
        );
        setDeleteTargetIds([]);
      },
    });
  }

  const [pageInfo, setPageInfo] = useState<AppTablePageInfo>({
    page: 1,
    pageSize: 25,
  });

  const {
    filters,
    setFilters,
    dateRange,
    setDateRange,
    status,
    from,
    to,
    sort,
    toggleSort,
  } = useTrackerFilters();

  const { data, isLoading } = useGetTrackers({
    page: pageInfo.page,
    limit: pageInfo.pageSize,
    sort,
    search: search_term,
    status,
    from,
    to,
  });

  const { data: statusData } = useGetAllStatus();

  const statuses: TrackerStatus[] = statusData?.data ?? EMPTY_ARRAY;

  const facets = useMemo(
    () => [
      {
        id: "status",
        label: "Status",
        options: statuses.map((s) => ({ label: s.name, value: s._id })),
      },
    ],
    [statuses],
  );

  const rows = data?.data?.docs ?? EMPTY_ARRAY;
  const total = data?.data?.total ?? 0;

  function OpenStatus() {
    setOpenModal(true);
  }

  function OpenReminders(tracker_id: string) {
    setReminderTrackerId(tracker_id);
    setOpenReminders(true);
  }

  const trackerColumns: AppTableColumn<TrackerRow>[] = useMemo(
    () => [
    {
  key: "select",
  label: (
    <Checkbox
      checked={
        rows.length > 0 &&
        rows.every((r: TrackerRow) => selectedIds.includes(r._id))
      }
      onCheckedChange={toggleSelectAll}
    />
  ),
  center: true,
  render: (row) => (
    <Checkbox
      checked={selectedIds.includes(row._id)}
      onCheckedChange={() => toggleSelect(row._id)}
    />
  ),
},
      {
        key: "company",
        label: "Company",
        render: (row) => (
          <div className="flex items-start gap-2 flex-col">
            <span className="font-medium">{row.company}</span>
            {row.image && (
              <span className="flex items-center justify-center w-20 max-h-9 rounded-md bg-white shrink-0 overflow-hidden">
                <img
                  src={row.image}
                  alt={row.company}
                  className=" object-contain"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.parentElement!.style.display = "none";
                  }}
                />
              </span>
            )}
          </div>
        ),
      },
      {
        key: "site_name",
        label: "Source",
        render: (row) => {
          if (!row.url || !row.site_name) {
            return "NA";
          }
          return (
            <a
              href={row.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline-offset-4 decoration-transparent transition-all duration-200 hover:underline hover:decoration-current"
            >
              {row.site_name}
            </a>
          );
        },
      },
      {
        key: "status",
        label: "Status",
        center: true,
        render: (row) => (
          <Badge
            variant="outline"
            style={{
              backgroundColor: `${row.status_result?.color}1a`,
              borderColor: row.status_result?.color,
            }}
          >
            {row.status_result?.name ?? "NA"}
          </Badge>
        ),
      },
      {
        key: "applied_on",
        label: "Applied On",
        render: (row) => formatDateTime(row.applied_on),
      },
      {
        key: "actions",
        label: "Actions",
        center: true,
        render: (row) => (
          <div className="flex items-center justify-center gap-1">
            <AppIconButton
              icon={<Pencil className="h-4 w-4" />}
              tooltip="Edit"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              href={`/job-tracker/edit/${row._id}`}
            />

            <AppIconButton
              icon={<BellPlus className="h-4 w-4" />}
              tooltip="Add Reminders"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => OpenReminders(row._id)}
            />

            <AppIconButton
              icon={<Trash2 className="h-4 w-4" />}
              variant="ghost"
              tooltip="Delete"
              size="icon"
              className="h-8 w-8 text-destructive"
              onClick={() => setDeleteTargetIds([row._id])}
            />

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
                  <DropdownMenuItem
                    onClick={() => handleSelect(null, row._id)}
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span className="truncate">Clear Status</span>
                  </DropdownMenuItem>

                  {statuses &&
                    statuses.length > 0 &&
                    statuses.map((item) => (
                      <DropdownMenuItem
                        key={item._id}
                        onClick={() => handleSelect(item._id, row._id)}
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
                    onClick={OpenStatus}
                    className="flex items-center gap-2 text-primary"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Status
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [statuses, selectedIds, status],
  );

  return (
    <>
      <BreadCrumbs items={items} />

      <div className=" flex flex-row items-center justify-between my-4">
        <div className="relative w-full max-w-sm ">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPageInfo((prev) => ({ ...prev, page: 1 }));
            }}
            placeholder="Search by job title or company"
            className="pl-9"
          />
        </div>
        <div>
          <AppIconButton
            icon={<Plus className="h-4 w-4" />}
            variant="default"
            tooltip="Add"
            size="icon"
            href={`/job-tracker/add`}
          />
        </div>
      </div>

      <Separator />

      <div className=" flex flex-row items-center my-4 gap-3">
        <AppIconButton
          icon={<ArrowUpDown className="h-4 w-4" />}
          variant="outline"
          tooltip={sort === "-1" ? "Newest first" : "Oldest first"}
          size="icon"
          className="h-9 w-9"
          onClick={toggleSort}
        />

        <AppliedDateFilter value={dateRange} onApply={setDateRange} />

        <FilterBar
          facets={facets}
          value={filters}
          onChange={setFilters}
          searchable={true}
          showCounts={false}
        />

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
      </div>

      <AppTable
        columns={trackerColumns}
        data={rows}
        totalCount={total}
        page={pageInfo.page}
        pageSize={pageInfo.pageSize}
        rowKey={(row) => row._id}
        loading={isLoading}
        onPageChange={setPageInfo}
      />

      <CreateStatus open={openModal} onOpenChange={setOpenModal} />

      {reminderTrackerId && (
        <AddReminder
          trackerId={reminderTrackerId}
          open={openReminders}
          onOpenChange={setOpenReminders}
        />
      )}

      <Dialog
        open={deleteTargetIds.length > 0}
        onOpenChange={(v) => !v && setDeleteTargetIds([])}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Delete{" "}
              {deleteTargetIds.length > 1
                ? `${deleteTargetIds.length} trackers`
                : "tracker"}
              ?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This can't be undone. The selected tracker
            {deleteTargetIds.length > 1 ? "s" : ""} will be permanently removed.
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