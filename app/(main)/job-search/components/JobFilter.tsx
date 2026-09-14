"use client";

import { FilterBar, type Facet } from "@/components/godui/filter-bar";
import { Checkbox } from "@/components/ui/checkbox";

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

const WORD_MODE_FILTER: Facet[] = [
  {
    id: "word_mode",
    label: "Work Mode",
    options: [
      { label: "Remote", value: "1" },
      { label: "Hybrid", value: "2" },
      { label: "On-site", value: "3" },
    ],
  },
];

export function WorkModelFilter() {
  return (
    <FilterBar
      facets={WORD_MODE_FILTER}
      searchable={false}
      showCounts={false}
      multiple={true}
    />
  );
}

const EXPERIENCE_LEVEL_FILTER: Facet[] = [
  {
    id: "experience_level",
    label: "Experience Level",
    options: [
      { label: "Entry Level", value: "entry" },
      { label: "Mid Level", value: "mid" },
      { label: "Senior", value: "senior" },
      { label: "Lead / Manager", value: "lead" },
    ],
  },
];

export function ExperienceLevelFilter() {
  return (
    <FilterBar
      facets={EXPERIENCE_LEVEL_FILTER}
      searchable={false}
      showCounts={false}
      multiple={true}
    />
  );
}

const JOB_TYPE = [
  { label: "Full Time", value: 1 },
  { label: "Part Time", value: 2 },
  { label: "Contract", value: 3 },
  { label: "Internship", value: 4 },
];

export function JobTypeFilter() {
  return (
    <div className="flex flex-col gap-1 min-w-[180px]">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-foreground">Job Type</span>
        <button
          type="button"
          className="text-sm font-medium text-destructive hover:underline underline-offset-2 transition-colors"
        >
          Clear all
        </button>
      </div>

      {JOB_TYPE.map((item) => (
        <label
          key={item.value}
          className="flex items-center gap-3 px-1 py-1.5 rounded-lg cursor-pointer hover:bg-accent transition-colors"
        >
          <Checkbox />
          <span className="text-sm text-foreground">{item.label}</span>
        </label>
      ))}
    </div>
  );
}
