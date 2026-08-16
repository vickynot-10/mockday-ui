import { useMemo, useState } from "react";
import { DateRange } from "react-day-picker";
import { FilterValue } from "@/components/godui/filter-bar";

export function useTrackerFilters() {
  const [filters, setFilters] = useState<FilterValue>({});
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [sort, setSort] = useState<"1" | "-1">("-1");

  const status = useMemo(() => filters.status?.join(",") ?? "", [filters.status]);
  const from = dateRange?.from ? dateRange.from.toISOString() : undefined;
  const to = dateRange?.to ? dateRange.to.toISOString() : undefined;

  function toggleSort() {
    setSort((prev) => (prev === "-1" ? "1" : "-1"));
  }

  return { filters, setFilters, dateRange, setDateRange, status, from, to, sort, toggleSort };
}