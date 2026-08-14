"use client";
import BreadCrumbs from "@/components/common/Breadcrumbs";
import useDebounce from "@/hooks/app/useDebounce";
import { useGetTrackers } from "@/hooks/queries/useTrackers";
import { useState } from "react";
import JobTrackerTable from "./components/TrackerTable";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import Tooltip from "@/components/common/ToolTip";
import AppVariantButton from "@/components/common/AppVariantButton";
import { AppTable, AppTableColumn, AppTablePageInfo } from "@/components/common/AppTable";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

const EMPTY_ARRAY: never[] = [];
const items = [{ label: "Apps", isSection: true }, { label: "Trackers" }];

const LIMIT_OPTIONS = [25, 50, 75, 100];


type Product = {
  id: number;
  name: string;
  subtitle: string;
  icon: string;
  category: string;
  categoryColor: string;
  sales: number;
  earnings: number;
  techIcons: string[];
};
 
const sampleData: Product[] = [
  {
    id: 1,
    name: "MaterialM - Admin",
    subtitle: "Dashboard Template",
    icon: "/icons/materialm.png",
    category: "Mobile",
    categoryColor: "#2dd4bf",
    sales: 2350,
    earnings: 24235,
    techIcons: ["/icons/ps.png"],
  },
  {
    id: 2,
    name: "MatDash - Admin",
    subtitle: "Dashboard Template",
    icon: "/icons/matdash.png",
    category: "Web App",
    categoryColor: "#38bdf8",
    sales: 1630,
    earnings: 13699,
    techIcons: ["/icons/figma.png", "/icons/vue.png"],
  },
  {
    id: 3,
    name: "Spike - Admin",
    subtitle: "Dashboard Template",
    icon: "/icons/spike.png",
    category: "Website",
    categoryColor: "#60a5fa",
    sales: 480,
    earnings: 13699,
    techIcons: ["/icons/xd.png", "/icons/bootstrap.png"],
  },
  {
    id: 4,
    name: "Modernize - Admin",
    subtitle: "Dashboard Template",
    icon: "/icons/modernize.png",
    category: "Marketing",
    categoryColor: "#fb923c",
    sales: 874,
    earnings: 10250,
    techIcons: ["/icons/angular.png"],
  },
  {
    id: 5,
    name: "MaterialPro - Admin",
    subtitle: "Dashboard Template",
    icon: "/icons/materialpro.png",
    category: "SSM",
    categoryColor: "#f87171",
    sales: 3715,
    earnings: 36400,
    techIcons: ["/icons/npm.png", "/icons/js.png"],
  },
];
 
const columns: AppTableColumn<Product>[] = [
  {
    key: "name",
    label: "Product Name",
    render: (row) => (
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
          <Image src={row.icon} alt={row.name} width={22} height={22} />
        </div>
        <div>
          <div className="font-medium text-foreground">{row.name}</div>
          <div className="text-sm text-muted-foreground">{row.subtitle}</div>
        </div>
      </div>
    ),
  },
  {
    key: "category",
    label: "Category",
    center: true,
    render: (row) => (
      <Badge
        variant="outline"
        style={{ color: row.categoryColor, borderColor: row.categoryColor }}
      >
        {row.category}
      </Badge>
    ),
  },
  {
    key: "sales",
    label: "Sales",
    center: true,
  },
  {
    key: "earnings",
    label: "Earnings",
    center: true,
    render: (row) => `$${row.earnings.toLocaleString()}`,
  },
  {
    key: "tech",
    label: "Technology",
    center: true,
    render: (row) => (
      <div className="flex items-center justify-center gap-1">
        {row.techIcons.map((icon) => (
          <Image key={icon} src={icon} alt="" width={24} height={24} />
        ))}
      </div>
    ),
  },
];
 

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

  const [pageInfo, setPageInfo] = useState<AppTablePageInfo>({
    page: 1,
    pageSize: 25,
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
              setPage(1);
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

   <AppTable<Product>
      columns={columns}
      data={sampleData}
      totalCount={sampleData.length}
      page={pageInfo.page}
      pageSize={pageInfo.pageSize}
      rowKey={(row) => row.id}
      onPageChange={setPageInfo}
    />
    </>
  );
}
