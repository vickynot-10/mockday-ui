"use client";
import { useState, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Upload, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUploadPDF } from "@/hooks/queries/useMultipart";
import { toast } from "sonner";

const MAX_FILES = 5;
const MAX_SIZE = 5 * 1024 * 1024;

function formatSize(bytes: number) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function PdfUploader({ onDone }: { onDone?: () => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate, isPending } = useUploadPDF();

  const addFiles = useCallback(
    (incoming: FileList | null) => {
      if (!incoming) return;
      const next = Array.from(incoming).filter((f) => f.type === "application/pdf");

      if (next.length !== incoming.length) {
        toast.error("Only PDF files are allowed");
      }

      setFiles((prev) => {
        const merged = [...prev, ...next];
        if (merged.length > MAX_FILES) {
          toast.error(`Max ${MAX_FILES} files allowed`);
          return merged.slice(0, MAX_FILES);
        }
        return merged;
      });
    },
    []
  );

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleSubmit = () => {
    if (files.length === 0) return;
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    mutate(formData, {
      onSuccess: () => {
        toast.success("Resumes uploaded");
        setFiles([]);
      },
      onError: () => {
        toast.error("Upload failed");
      },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <motion.div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        animate={{
          borderColor: isDragging ? "hsl(var(--primary))" : "hsl(var(--border))",
          backgroundColor: isDragging ? "hsl(var(--accent))" : "transparent",
        }}
        className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-10 cursor-pointer"
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          hidden
          onChange={(e) => addFiles(e.target.files)}
        />
        <div className="rounded-full border p-3">
          <Upload className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="font-medium">Drag & drop files here</p>
        <p className="text-sm text-muted-foreground">
          Or click to browse (max {MAX_FILES} files, up to 5MB each)
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
        >
          Browse files
        </Button>
      </motion.div>

      <AnimatePresence>
        {files.map((file, index) => (
          <motion.div
            key={file.name + index}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
              </div>
            </div>
            <button onClick={() => removeFile(index)}>
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {files.length > 0 && (
        <Button onClick={handleSubmit} disabled={isPending}>
          {isPending ? "Uploading..." : "Upload"}
        </Button>
      )}
    </div>
  );
}