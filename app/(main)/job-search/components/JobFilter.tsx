"use client";

import { FilterBar, type Facet } from "@/components/godui/filter-bar";

const JOB_POSTED_FILTER: Facet[] = [
  {
    id: "job_posted",
    label: "Job Posted",
    options: [
      { label: "Last 24h", value: "1" },
      { label: "Last 7 Days", value: "2" },
      { label: "Last 30 Days", value: "3" },
    ],
  },
];

export function JobPostedFilter() {
  return (
    <FilterBar
      facets={JOB_POSTED_FILTER}
      searchable={false}
      showCounts={false}
      multiple={false}
    />
  );
}
