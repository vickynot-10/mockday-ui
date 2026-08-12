"use client";
import BreadCrumbs from "@/components/common/Breadcrumbs";
import { useGetStatus, useSaveStatus } from "@/hooks/queries/useStatus";
const items = [
  { label: "Settings", isSection: true },
  { label: "Tracker Status" },
];
export default function CustomizableStatus() {
  return (
    <>
      <BreadCrumbs items={items} />
    </>
  );
}
