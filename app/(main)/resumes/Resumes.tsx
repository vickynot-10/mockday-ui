"use client";
import BreadCrumbs from "@/components/common/Breadcrumbs";
import { JellyButton } from "@/components/godui/jelly-button";
import { Plus, Download, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PdfUploader from "./components/PdfUploader";
import { useState } from "react";
import { useGetResumes, useDownloadURL } from "@/hooks/queries/useResumes";

const items = [{ label: "Resumes" }];
const MAX_RESUMES = 3;

export default function Resumes() {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useGetResumes();
  const { mutate, isPending, variables: downloadingId } = useDownloadURL();

  const resumes = data?.data ?? [];

  function handleDownload(id: string, filename: string) {
    mutate(id, {
      onSuccess: (res) => {
        const a = document.createElement("a");
        a.href = res.data.download_url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      },
    });
  }

  return (
    <>
      <BreadCrumbs items={items} />

      <div className="flex flex-row items-center justify-between mt-4">
        <span className="text-sm text-muted-foreground">
          {resumes.length} / {MAX_RESUMES} resumes
        </span>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <JellyButton
                variant="primary"
                size="sm"
                className="flex flex-row items-center gap-2"
                disabled={resumes.length >= MAX_RESUMES}
              />
            }
          >
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

      <div className="flex flex-col gap-2 mt-4">
        {isLoading && (
          <p className="text-sm text-muted-foreground">Loading...</p>
        )}

        {!isLoading && resumes.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No resumes uploaded yet.
          </p>
        )}

        {resumes.map((resume: any) => (
          <div
            key={resume._id}
            className="flex flex-row items-center justify-between border rounded-lg px-4 py-3"
          >
            <div className="flex flex-row items-center gap-3">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{resume.filename}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(resume.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleDownload(resume._id, resume.filename)}
              disabled={isPending && downloadingId === resume._id}
              className="p-2 hover:bg-muted rounded-md"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}