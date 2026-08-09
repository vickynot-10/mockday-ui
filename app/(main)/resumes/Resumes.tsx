"use client";
import BreadCrumbs from "@/components/common/Breadcrumbs";
import { JellyButton } from "@/components/godui/jelly-button";
import { Download, Loader2, Star, Trash2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import PdfUploader from "./components/PdfUploader";
import { useState } from "react";
import {
  useGetResumes,
  useDownloadURL,
  useMarkAsDefault,
  useDeleteResumes,
} from "@/hooks/queries/useResumes";
import { motion, AnimatePresence } from "framer-motion";
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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteTargetIds, setDeleteTargetIds] = useState<string[]>([]);

  const { data, isLoading } = useGetResumes();
  const { mutate, isPending, variables } = useDownloadURL();
  const {
    mutate: markAsDefault,
    isPending: marking,
    variables: markingId,
  } = useMarkAsDefault();
  const {
    mutate: deleteResumes,
    isPending: deleting,
    variables: deletingIds,
  } = useDeleteResumes();

  const resumes = data?.data ?? [];

  function handleDownload(id: string, filename: string) {
    mutate(
      { id, mode: "download" },
      {
        onSuccess: (res) => {
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

  function handleView(previewUrl: string) {
    window.open(previewUrl, "_blank");
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function confirmDelete() {
    deleteResumes(deleteTargetIds, {
      onSuccess: () => {
        setSelectedIds((prev) =>
          prev.filter((id) => !deleteTargetIds.includes(id)),
        );
        setDeleteTargetIds([]);
      },
    });
  }

  function isLoadingAction(id: string, mode: "view" | "download") {
    return isPending && variables?.id === id && variables?.mode === mode;
  }

  function isCardDeleting(id: string) {
    return deleting && deletingIds?.includes(id);
  }

  return (
    <>
      <BreadCrumbs items={items} />

      <div className="flex flex-row items-center justify-between mt-4">
        <div className="flex flex-row items-center gap-3">
          {resumes.length > 0 && (
            <Checkbox
              checked={selectedIds.length === resumes.length}
              onCheckedChange={(checked) =>
                setSelectedIds(checked ? resumes.map((r: any) => r._id) : [])
              }
            />
          )}

          <span className="text-sm text-muted-foreground">
            {resumes.length} / {MAX_RESUMES} resumes
          </span>

          {selectedIds.length > 0 && (
            <JellyButton
              variant="destructive"
              size="sm"
              className="flex flex-row items-center gap-2"
              onClick={() => setDeleteTargetIds(selectedIds)}
            >
              <Trash2 className="w-4 h-4" />
              Delete {selectedIds.length} selected
            </JellyButton>
          )}
        </div>

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
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
              whileHover={{ y: -3 }}
            >
              <Card className="h-full overflow-hidden">
                <CardContent className="px-0">
                  <button
                    onClick={() => handleView(resume.preview_url)}
                    className="relative w-full h-52 bg-muted border-b overflow-hidden block"
                  >
                    <iframe
                      src={`${resume.preview_url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                      className="absolute top-0 left-0 pointer-events-none"
                      style={{
                        width: "200%",
                        height: "200%",
                        transform: "scale(0.5)",
                        transformOrigin: "top left",
                      }}
                      title={resume.filename}
                    />

                    <div
                      className="absolute top-2 left-2 bg-background/90 rounded-md p-0.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={selectedIds.includes(resume._id)}
                        onCheckedChange={() => toggleSelect(resume._id)}
                      />
                    </div>
                  </button>
                </CardContent>

                <CardHeader className="flex flex-row items-start justify-between gap-2">
                  <div className="flex flex-col gap-1 min-w-0">
                    <CardTitle className="truncate">
                      {resume.filename ?? "Resume"}
                    </CardTitle>
                    <CardDescription>
                      Uploaded on {formatDate(resume.created_at)}.
                    </CardDescription>
                  </div>

                  <button
                    onClick={() => markAsDefault(resume._id)}
                    disabled={marking || resume.default}
                    className="shrink-0 disabled:cursor-default"
                  >
                    {marking && markingId === resume._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Star
                        className={`w-4 h-4 ${
                          resume.default
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      />
                    )}
                  </button>
                </CardHeader>

                <CardContent className="flex flex-col gap-3 p-4 pt-0">
                  <CardFooter className="gap-3 p-0 max-sm:flex-col max-sm:items-stretch">
                    <JellyButton
                      variant="primary"
                      size="sm"
                      className="flex-1 flex flex-row items-center justify-center gap-1.5"
                      onClick={() =>
                        handleDownload(resume._id, resume.filename)
                      }
                      disabled={isPending}
                    >
                      {isLoadingAction(resume._id, "download") ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      Download
                    </JellyButton>

                    <JellyButton
                      variant="outline"
                      size="sm"
                      className="flex-1 flex flex-row items-center justify-center gap-1.5"
                      onClick={() => setDeleteTargetIds([resume._id])}
                      disabled={isCardDeleting(resume._id)}
                    >
                      {isCardDeleting(resume._id) ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                      Delete
                    </JellyButton>
                  </CardFooter>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <Dialog
        open={deleteTargetIds.length > 0}
        onOpenChange={(v) => !v && setDeleteTargetIds([])}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>
              Delete{" "}
              {deleteTargetIds.length > 1
                ? `${deleteTargetIds.length} resumes`
                : "resume"}
              ?
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This can't be undone. The selected file
            {deleteTargetIds.length > 1 ? "s" : ""} will be permanently removed.
          </p>
          <DialogFooter className="flex flex-row justify-end gap-2 mt-2">
            <JellyButton
              variant="outline"
              size="sm"
              onClick={() => setDeleteTargetIds([])}
              disabled={deleting}
            >
              Cancel
            </JellyButton>
            <JellyButton
              variant="destructive"
              size="sm"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                "Delete"
              )}
            </JellyButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
