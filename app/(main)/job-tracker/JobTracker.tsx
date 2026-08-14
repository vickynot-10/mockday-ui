"use client";
import BreadCrumbs from "@/components/common/Breadcrumbs";
import useDebounce from "@/hooks/app/useDebounce";
import { useGetTrackers } from "@/hooks/queries/useTrackers";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import Tooltip from "@/components/common/ToolTip";
import AppVariantButton from "@/components/common/AppVariantButton";

import {
  AppTable,
  AppTableColumn,
  AppTablePageInfo,
} from "@/components/common/AppTable";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const EMPTY_ARRAY: never[] = [];
const items = [{ label: "Apps", isSection: true }, { label: "Trackers" }];

type TrackerRow = {
  _id: string;
  company: string;
  url: string;
  page_title: string;
  h1: string;
  description: string;
  image: string;
  site_name: string;
  title: string;
  applied_on: string;
  status: string;
};

const trackerColumns: AppTableColumn<TrackerRow>[] = [
  {
    key: "company",
    label: "Company",
    render: (row) => (
      <div className="flex items-center gap-2">
        {row.image ? (
          <img
            src={row.image}
            alt={row.company}
            width={20}
            height={20}
            className="rounded object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : null}
        <span className="font-medium">{row.company}</span>
      </div>
    ),
  },
  {
    key: "title",
    label: "Role",
    render: (row) => (
      <Link
        href={row.url}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline"
      >
        {row.title || row.page_title}
      </Link>
    ),
  },
  {
    key: "site_name",
    label: "Source",
  },
  {
    key: "status",
    label: "Status",
    center: true,
    render: (row) => <Badge variant="secondary">{row.status}</Badge>,
  },
  {
    key: "applied_on",
    label: "Applied On",
    render: (row) => new Date(row.applied_on).toLocaleDateString(),
  },
];

export default function JobTracker() {
  const [search, setSearch] = useState("");
  const search_term = useDebounce(search, 500);

  const [pageInfo, setPageInfo] = useState<AppTablePageInfo>({
    page: 1,
    pageSize: 25,
  });
  const [sort, setSort] = useState<"1" | "-1">("-1");
  const { data, isLoading } = useGetTrackers({
    page: pageInfo.page,
    limit: pageInfo.pageSize,
    sort,
    search: search_term,
  });

  const rows = data?.data?.docs ?? EMPTY_ARRAY;
  const total = data?.data?.total ?? 0;

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
          <Tooltip content="Add a Tracker">
            <AppVariantButton>
              <Plus />
            </AppVariantButton>
          </Tooltip>
        </div>
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
    </>
  );
}
