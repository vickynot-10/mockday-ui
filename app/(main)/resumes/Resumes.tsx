"use client";
import BreadCrumbs from "@/components/common/Breadcrumbs";
import { JellyButton } from "@/components/godui/jelly-button";
import { Plus } from "lucide-react";

const items = [{ label: "Resumes" }];

export default function Resumes() {
  return (
    <>
      <BreadCrumbs items={items} />

      <div className=" flex flex-row items-center justify-end">
        <JellyButton
          variant="primary"
          size="sm"
          className="flex flex-row items-center gap-2"
        >
          <Plus /> Upload Resumes
        </JellyButton>
      </div>
    </>
  );
}
