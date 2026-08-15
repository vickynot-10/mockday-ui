"use client";
import BreadCrumbs from "@/components/common/Breadcrumbs";
import useDebounce from "@/hooks/app/useDebounce";
import { useGetTrackers } from "@/hooks/queries/useTrackers";
import StatusMenu from "./components/StatusChange";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { formatDateTime } from "@/utils/formatDateTime";
import {
  AppTable,
  AppTableColumn,
  AppTablePageInfo,
} from "@/components/common/AppTable";
import { Badge } from "@/components/ui/badge";
import AppIconButton from "@/components/common/AppIconButton";
import AddOrEditTrackerModal from "./components/AddoreditTracker";
import { useForm } from "react-hook-form";

const EMPTY_ARRAY: never[] = [];
const items = [{ label: "Apps", isSection: true }, { label: "Trackers" }];

type TrackerStatus = {
  _id: string;
  name: string;
  color: string;
};

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
  status_result: TrackerStatus;
};

type TrackerForm = {
  _id?: string | null;
  company: string;
  title: string;
  url: string;
  description: string;
  page_title: string;
  h1: string;
  site_name: string;
};

const EMPTY_FORM: TrackerForm = {
  company: "",
  title: "",
  url: "",
  description: "",
  page_title: "",
  h1: "",
  site_name: "",
};
export default function JobTracker() {
  const [search, setSearch] = useState("");
  const search_term = useDebounce(search, 500);

  const [selectedItem, setSelectedItem] = useState<null | TrackerRow>(null);
  const [selectedIds, setSelectedIds] = useState(EMPTY_ARRAY);
  const [openModal, setModalOpen] = useState(false);
  const [pageInfo, setPageInfo] = useState<AppTablePageInfo>({
    page: 1,
    pageSize: 25,
  });
  const [sort, setSort] = useState<"1" | "-1">("-1");

  const { register, handleSubmit, reset } = useForm<TrackerForm>({
    defaultValues: EMPTY_FORM,
  });

  const { data, isLoading } = useGetTrackers({
    page: pageInfo.page,
    limit: pageInfo.pageSize,
    sort,
    search: search_term,
  });

  function OpenAddorEdit(item?: TrackerRow) {
    if (item) {
      setSelectedItem(item);
      reset(item)
    } else {
      setSelectedItem(null);
      reset()
    }
    setModalOpen(true);
  }

  function onSubmit(values: TrackerForm) {
    const payload = selectedItem ? { ...values, _id: selectedItem._id } : values;
   console.log(payload)
  }

  function OpenDelete() {
    setModalOpen(true);
  }

  function CloseModal() {
    setModalOpen(false);
    setSelectedItem(null);
    setSelectedIds(EMPTY_ARRAY);
  }

  const rows = data?.data?.docs ?? EMPTY_ARRAY;
  const total = data?.data?.total ?? 0;

  const trackerColumns: AppTableColumn<TrackerRow>[] = [
    {
      key: "company",
      label: "Company",
      render: (row) => (
        <div className="flex items-start gap-2 flex-col">
          <span className="font-medium">{row.company}</span>
          {row.image && (
            <span className="flex items-center justify-center w-20 max-h-9 rounded-md bg-white shrink-0 overflow-hidden">
              <img
                src={row.image}
                alt={row.company}
                className=" object-contain"
                onError={(e) => {
                  e.currentTarget.parentElement!.style.display = "none";
                }}
              />
            </span>
          )}
        </div>
      ),
    },
    {
      key: "site_name",
      label: "Source",
      render: (row) => (
        <a
          href={row.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline-offset-4 decoration-transparent transition-all duration-200 hover:underline hover:decoration-current"
        >
          {row.site_name}
        </a>
      ),
    },
    {
      key: "status",
      label: "Status",
      center: true,
      render: (row) => (
        <Badge
          variant="outline"
          style={{
            backgroundColor: `${row.status_result?.color}1a`,
            borderColor: row.status_result?.color,
          }}
        >
          {row.status_result?.name ?? "Applied"}
        </Badge>
      ),
    },
    {
      key: "applied_on",
      label: "Applied On",
      render: (row) => formatDateTime(row.applied_on),
    },
    {
      key: "actions",
      label: "Actions",
      center: true,
      render: (row) => (
        <div className="flex items-center justify-center gap-1">
          <AppIconButton
            icon={<Pencil className="h-4 w-4" />}
            tooltip="Edit"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => OpenAddorEdit(row)}
          />
          <AppIconButton
            icon={<Trash2 className="h-4 w-4" />}
            variant="ghost"
            tooltip="Delete"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={OpenDelete}
          />
          <StatusMenu id={row._id} status={row.status} />
        </div>
      ),
    },
  ];

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
          <AppIconButton
            icon={<Plus className="h-4 w-4" />}
            variant="default"
            tooltip="Add"
            size="icon"
            onClick={() => OpenAddorEdit()}
          />
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
