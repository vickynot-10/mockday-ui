"use client";
import BreadCrumbs from "@/components/common/Breadcrumbs";
import { JellyButton } from "@/components/godui/jelly-button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PdfUploader from "./components/PdfUploader";
import { useState } from "react";

const items = [{ label: "Resumes" }];

export default function Resumes() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <BreadCrumbs items={items} />

      <div className="flex flex-row items-center justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<JellyButton variant="primary" size="sm" className="flex flex-row items-center gap-2" />}>
            <Plus /> Upload Resumes
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Upload Resumes</DialogTitle>
            </DialogHeader>
            <PdfUploader onDone={() => setOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}