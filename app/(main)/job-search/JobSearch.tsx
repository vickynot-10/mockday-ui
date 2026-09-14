"use client";

import { Input } from "@/components/ui/input";
import { MapPin, Search } from "lucide-react";
import { AppButton } from "@/components/common/AppButton";
import { JobPostedFilter } from "./components/JobFilter";

const JOB_TYPE = [
  { label: "Full Time", value: 1 },
  { label: "Part Time", value: 2 },
  { label: "Contract", value: 3 },
  { label: "Internship", value: 4 },
];

const WORK_MODE = [
  { label: "Remote", value: 1 },
  { label: "Hybrid", value: 2 },
  { label: "On-site", value: 3 },
];

const SORT_BY = [
  { label: "Relevance", value: 1 },
  { label: "Newest First", value: 2 },
  { label: "Highest Salary", value: 3 },
  { label: "Lowest Salary", value: 4 },
];

export default function JobsSearch() {
  return (
    <div className=" w-full flex items-center flex-row  justify-between">
      <div className="flex items-center rounded-full border border-border bg-background shadow-sm px-2 py-1.5 gap-1">
        <div className="flex items-center flex-1 gap-2 px-3">
          <Search className="shrink-0 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Job title or keyword"
            className="border-none shadow-none !bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground text-sm h-9 p-0"
          />
        </div>

        <div className="w-px h-6 bg-border shrink-0" />

        <div className="flex items-center flex-1 gap-2 px-3">
          <MapPin className="shrink-0 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Add country or city"
            className="border-none shadow-none !bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground text-sm h-9 p-0"
          />
        </div>

        <AppButton
          idleLabel="Search"
          className="rounded-full min-w-0 px-6 py-2 text-sm"
        />
      </div>

      <div className="    flex items-center  flex-row gap-3">
        <JobPostedFilter />
      </div>
    </div>
  );
}
