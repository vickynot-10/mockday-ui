import { useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { FilterValue } from "@/components/godui/filter-bar";

export function useTrackerFilters() {
  const [filters, setFilters] = useState<FilterValue>({});
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [sort, setSort] = useState<"1" | "-1">("-1");
  const [reminder ,setReminder] = useState<0 | 1 | 2>(0)
  const status = useMemo(() => filters.status?.join(",") ?? "", [filters.status]);
  const from = dateRange?.from ? dateRange.from.toISOString() : undefined;
  const to = dateRange?.to ? dateRange.to.toISOString() : undefined;

  function toggleSort() {
    setSort((prev) => (prev === "-1" ? "1" : "-1"));
  }

function toggleReminder() {
  setReminder((prev) => {
    if (prev === 0) return 1;
    if (prev === 1) return 2;
    return 0;
  });
}

  return { filters, setFilters, dateRange, setDateRange, status, from, to, sort, toggleSort , reminder ,toggleReminder};
}