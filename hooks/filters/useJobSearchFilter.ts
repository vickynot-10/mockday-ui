"use client";

import { useState, useEffect } from "react";
import useDebounce from "../app/useDebounce";

const DEFAULT_FILTERS = {
  keyword: "",
  location: "",
  country: "in",
  job_posted: "",
  work_mode: [] as string[],
  experience_level: [] as string[],
  job_type: [] as string[],
  sort_by: "1",
  salary_min: 0,
  salary_max: 0,
};

export function useJobSearchFilters() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const debouncedFilters = useDebounce(filters, 400);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  function updateFilter<K extends keyof typeof DEFAULT_FILTERS>(
    key: K,
    value: (typeof DEFAULT_FILTERS)[K],
  ) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function toggleArrayFilter(
    key: "work_mode" | "experience_level" | "job_type",
    value: string,
  ) {
    setFilters((prev) => {
      const current = prev[key];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }

  return {
    filters,
    debouncedFilters,
    updateFilter,
    toggleArrayFilter,
    resetFilters,
    page,
    setPage,
  };
}
