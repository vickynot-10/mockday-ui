"use client";
import BreadCrumbs from "@/components/common/Breadcrumbs";
import useDebounce from "@/hooks/app/useDebounce";
import { useGetTrackers } from "@/hooks/queries/useTrackers";
import { useState } from "react";
import JobTrackerTable from "./components/TrackerTable";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { JellyButton } from "@/components/godui/jelly-button";
import Tooltip from "@/components/common/ToolTip";
const EMPTY_ARRAY: never[] = [];
const items = [{ label: "Apps", isSection: true }, { label: "Trackers" }];

const LIMIT_OPTIONS = [25, 50, 75, 100];

export default function JobTracker() {
  const [search, setSearch] = useState("");
  const search_term = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [sort, setSort] = useState<"1" | "-1">("-1");
  const [selectedIds, setSelectedIds] = useState<string[]>(EMPTY_ARRAY);

  const { data, isLoading } = useGetTrackers({
    page,
    limit,
    sort,
    search: search_term,
  });

  const rows = data?.data?.docs ?? EMPTY_ARRAY;
  const total = data?.data?.total ?? 0;

  return (
    <>
      <BreadCrumbs items={items} />

      <div className=" flex flex-row items-center justify-between mb-4">
        <div className="relative w-full max-w-sm ">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by job title or company"
            className="pl-9"
          />
        </div>
        <div>
          <Tooltip content="Add a Tracker">
            <JellyButton size="sm">
              <Plus />
            </JellyButton>
          </Tooltip>
        </div>
      </div>

      <JobTrackerTable
        docs={rows}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
      />
    </>
  );
}
