"use client";
import BreadCrumbs from "@/components/common/Breadcrumbs";
import { JellyButton } from "@/components/godui/jelly-button";
import { Plus, Download, Eye, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import PdfUploader from "./components/PdfUploader";
import { useState } from "react";
import { useGetResumes, useDownloadURL, useMarkAsDefault } from "@/hooks/queries/useResumes";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { MAX_RESUMES } from "@/constants";

const items = [{ label: "Resumes" }];

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Resumes() {
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useGetResumes();
  const { mutate, isPending, variables } = useDownloadURL();
  const { mutate : markAsDefault , isPending : marking } =useMarkAsDefault()

  const resumes = data?.data ?? [];

  function handleAction(id: string, filename: string, mode: "view" | "download") {
    mutate(
      { id, mode },
      {
        onSuccess: (res) => {
          if (mode === "view") {
            window.open(res.data.download_url, "_blank");
            return;
          }
          const a = document.createElement("a");
          a.href = res.data.download_url;
          a.download = filename ?? "resume.pdf";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        },
      },
    );
  }

  function isLoadingAction(id: string, mode: "view" | "download") {
    return isPending && variables?.id === id && variables?.mode === mode;
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
        {isLoading && (
          <p className="text-sm text-muted-foreground col-span-full">
            Loading...
          </p>
        )}

        {!isLoading && resumes.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-full">
            No resumes uploaded yet.
          </p>
        )}

        <AnimatePresence mode="popLayout">
          {resumes.map((resume: any, i: number) => (
            <motion.div
              key={resume._id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
              whileHover={{ y: -2 }}
            >
              <Card className="h-full">
                <CardContent className="flex flex-col gap-4 p-4">
                  <div className="flex items-start justify-between">
                    <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center">
                      <Image
                        src="/pdf_icon.png"
                        alt="PDF"
                        width={20}
                        height={20}
                      />
                    </div>

                    <div className="flex flex-row items-center gap-2">
                      <JellyButton
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleAction(resume._id, resume.filename, "view")
                        }
                        disabled={isPending}
                      >
                        {isLoadingAction(resume._id, "view") ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </JellyButton>

                      <JellyButton
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          handleAction(resume._id, resume.filename, "download")
                        }
                        disabled={isPending}
                      >
                        {isLoadingAction(resume._id, "download") ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </JellyButton>
                    </div>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium truncate">
                      {resume.filename ?? "Resume"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Uploaded on {formatDate(resume.created_at)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}