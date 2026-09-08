"use client";
import JobTrackerKanbanView from "./components/TrackerKanban";
import useDebounce from "@/hooks/app/useDebounce";
import { FilterBar } from "@/components/godui/filter-bar";
import AppliedDateFilter from "@/components/common/DatePicker";
import { useTrackerFilters } from "@/hooks/filters/useTrackerFilters";
import { ArrowUpDown } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useGetAllStatus } from "@/hooks/queries/useStatus";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import AppIconButton from "@/components/common/AppIconButton";
import CreateStatus from "@/components/common/CreateStatus";
import ViewToggleButtonGroup from "./components/ViewToggle";
import JobTrackerTableView from "./components/TrackerTableView";

import ReminderFilterButton from "./components/ReminderButton";

const REMINDER_TOOLTIP = {
  0: "All",
  1: "Only with reminder",
  2: "No reminder",
} as const;

const EMPTY_ARRAY: never[] = [];

export type TrackerStatus = {
  _id: string;
  name: string;
  color: string;
};

export type TrackerRow = {
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
  const [view, setView] = useState("kanban");
  const [search, setSearch] = useState("");
  const search_term = useDebounce(search, 500);
  const [openModal, setOpenModal] = useState<boolean>(false);

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
    reminder,toggleReminder
  } = useTrackerFilters();

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

  const trackerFilters = { sort, search: search_term, status, from, to , reminder};

  return (
    <>
      <div className="flex flex-row items-center justify-between my-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job title or company"
            className="pl-9"
          />
        </div>
        <AppIconButton
          icon={<Plus className="h-4 w-4" />}
          variant="default"
          tooltip="Add"
          size="icon"
          href={`/job-tracker/add`}
        />
      </div>

      <Separator />

      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-row items-center my-4 gap-3">
          <AppIconButton
            icon={<ArrowUpDown className="h-4 w-4" />}
            variant="outline"
            tooltip={sort === "-1" ? "Newest first" : "Oldest first"}
            size="icon"
            className="h-9 w-9"
            onClick={toggleSort}
          />
<AppIconButton
  icon={<ReminderFilterButton value={reminder} />}
  variant="outline"
  tooltip={REMINDER_TOOLTIP[reminder]}
  size="icon"
  className="h-9 w-9"
  onClick={toggleReminder}
/>
          <AppliedDateFilter value={dateRange} onApply={setDateRange} />

          <FilterBar
            facets={facets}
            value={filters}
            onChange={setFilters}
            searchable={true}
            showCounts={false}
          />
        </div>
        <ViewToggleButtonGroup view={view} setView={setView} />
      </div>

      {view === "table" && (
        <JobTrackerTableView
          filters={trackerFilters}
          statuses={statuses}
          onAddStatus={() => setOpenModal(true)}
        />
      )}
      {
        view === "kanban" && <JobTrackerKanbanView filters={trackerFilters} statuses={statuses} />
      }

      <CreateStatus open={openModal} onOpenChange={setOpenModal} />
    </>
  );
}
