"use client";
import BreadCrumbs from "@/components/common/Breadcrumbs";
import useDebounce from "@/hooks/app/useDebounce";
import { useGetTrackers } from "@/hooks/queries/useTrackers";
import { useState } from "react";

const EMPTY_ARRAY: never[] = [];
const items = [{ label: "Trackers" }];

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
    search,
  });

  return (
    <>
      <BreadCrumbs items={items} />
    </>
  );
}
