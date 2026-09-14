"use client";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FilterBarNoFilter,
  type Facet,
} from "@/components/common/FilterBarNoClear";
import { useJobFiltersStore } from "@/stores/jobfilter.store";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Target, Clock, TrendingUp } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import AppIconButton from "@/components/common/AppIconButton";

const FACET_KEYS = ["job_posted", "experience_level", "work_mode"] as const;

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
const WORK_MODE_FILTER: Facet[] = [
  {
    id: "work_mode",
    label: "Work Mode",
    options: [
      { label: "Remote", value: "1" },
      { label: "Hybrid", value: "2" },
      { label: "On-site", value: "3" },
    ],
  },
];

export function JobPostedFilter() {
  const job_posted = useJobFiltersStore((s) => s.job_posted);
  const setSingle = useJobFiltersStore((s) => s.setSingle);

  return (
    <FilterBarNoFilter
      facets={JOB_POSTED_FILTER}
      searchable={false}
      showCounts={false}
      multiple={false}
      value={{ job_posted: job_posted ? [job_posted] : [] }}
      onChange={(next) => {
        const selected = next.job_posted?.[0] ?? "";
        setSingle("job_posted", selected);
      }}
    />
  );
}

export function ExperienceLevelFilter() {
  const experience_level = useJobFiltersStore((s) => s.experience_level);
  const toggleFacet = useJobFiltersStore((s) => s.toggleFacet);

  return (
    <FilterBarNoFilter
      facets={EXPERIENCE_LEVEL_FILTER}
      searchable={false}
      showCounts={false}
      multiple={true}
      value={{ experience_level }}
      onChange={(next) => {
        const selected = next.experience_level ?? [];
        const added = selected.find((v) => !experience_level.includes(v));
        const removed = experience_level.find((v) => !selected.includes(v));
        if (added) toggleFacet("experience_level", added, true);
        if (removed) toggleFacet("experience_level", removed, true);
      }}
    />
  );
}

export function WorkModelFilter() {
  const work_mode = useJobFiltersStore((s) => s.work_mode);
  const toggleFacet = useJobFiltersStore((s) => s.toggleFacet);
  return (
    <div className="flex items-center gap-2">
      <FilterBarNoFilter
        facets={WORK_MODE_FILTER}
        searchable={false}
        showCounts={false}
        multiple={true}
        value={{ work_mode }}
        onChange={(next) => {
          const selected = next.work_mode ?? [];
          const added = selected.find((v) => !work_mode.includes(v));
          const removed = work_mode.find((v) => !selected.includes(v));
          if (added) toggleFacet("work_mode", added, true);
          if (removed) toggleFacet("work_mode", removed, true);
        }}
      />
    </div>
  );
}

export function FacetClearButton() {
  const job_posted = useJobFiltersStore((s) => s.job_posted);
  const experience_level = useJobFiltersStore((s) => s.experience_level);
  const work_mode = useJobFiltersStore((s) => s.work_mode);
  const clearFacet = useJobFiltersStore((s) => s.clearFacet);

  const values = { job_posted, experience_level, work_mode };

  const hasAnySelection = FACET_KEYS.some((key) => {
    const v = values[key];
    return Array.isArray(v) ? v.length > 0 : Boolean(v);
  });

  if (!hasAnySelection) return null;

  function handleClear() {
    FACET_KEYS.forEach((key) => clearFacet(key));
  }

  return (
    <button
      type="button"
      onClick={handleClear}
      className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
    >
      Clear
    </button>
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

const SORT_ICONS = {
  relevance: Target,
  newest: Clock,
  salary_high: ArrowUp,
  salary_low: ArrowDown,
};

function SortFilterIcon({ value }: { value: keyof typeof SORT_ICONS }) {
  const Icon = SORT_ICONS[value];

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={value}
        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="flex items-center justify-center"
      >
        <Icon className="h-4 w-4" />
      </motion.span>
    </AnimatePresence>
  );
}
const SORT_TOOLTIPS = {
  relevance: "Relevance",
  newest: "Newest first",
  salary_high: "Highest salary",
  salary_low: "Lowest salary",
};
export function ToggleSortButton() {
  const sort_by = useJobFiltersStore((s) => s.sort_by);
  const setSingle = useJobFiltersStore((s) => s.setSingle);

  const SORT_ORDER = [
    "relevance",
    "newest",
    "salary_high",
    "salary_low",
  ] as const;

  function toggleSort() {
    const currentIndex = SORT_ORDER.indexOf(
      sort_by as (typeof SORT_ORDER)[number],
    );
    const nextIndex = (currentIndex + 1) % SORT_ORDER.length;
    setSingle("sort_by", SORT_ORDER[nextIndex]);
  }

  return (
    <AppIconButton
      icon={<SortFilterIcon value={sort_by as keyof typeof SORT_ICONS} />}
      variant="outline"
      tooltip={SORT_TOOLTIPS[sort_by as keyof typeof SORT_TOOLTIPS]}
      size="icon"
      className="h-9 w-9"
      onClick={toggleSort}
    />
  );
}
