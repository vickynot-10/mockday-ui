"use client";
import { useState, useRef, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Upload, X, FileText, Loader2, Check } from "lucide-react";
import { api } from "@/utils/axios";
import { toast } from "sonner";

const MAX_FILES = 5;

type FileEntry = {
  file: File;
  status: "uploading" | "done" | "error";
};

function formatSize(bytes: number) {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function PdfUploader({ onDone }: { onDone?: () => void }) {
  const [entries, setEntries] = useState<FileEntry[]>([]);
  const entriesRef = useRef<FileEntry[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateEntryStatus = (file: File, status: FileEntry["status"]) => {
    entriesRef.current = entriesRef.current.map((e) =>
      e.file === file ? { ...e, status } : e,
    );
    setEntries(entriesRef.current);
  };

  const uploadFile = async (file: File) => {
    try {
      const urlRes = await api.post("/upload/get-urls", {
        filenames: [file.name],
      });
      const { upload_url, file_id, key, filename } = urlRes.data.files[0];

      await fetch(upload_url, {
        method: "PUT",
        body: file,
      });
      //   await fetch(upload_url, {
      //     method: "PUT",
      //     headers: { "Content-Type": "application/pdf" },
      //     body: file,
      //   });

      await api.post("/upload/confirm", {
        files: [{ filename, file_id, key }],
      });

      updateEntryStatus(file, "done");
      toast.success(`${file.name} uploaded`);
      onDone?.();
    } catch {
      updateEntryStatus(file, "error");
      toast.error(`${file.name} failed to upload`);
    }
  };

  const addFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return;
    const valid = Array.from(incoming).filter(
      (f) => f.type === "application/pdf",
    );

    if (valid.length !== incoming.length) {
      toast.error("Only PDF files are allowed");
    }

    const room = MAX_FILES - entriesRef.current.length;
    const accepted = valid.slice(0, room);

    if (valid.length > room) {
      toast.error(`Max ${MAX_FILES} files allowed`);
    }

    if (accepted.length === 0) return;

    const next = accepted.map((file) => ({
      file,
      status: "uploading" as const,
    }));
    entriesRef.current = [...entriesRef.current, ...next];
    setEntries(entriesRef.current);

    accepted.forEach((file) => uploadFile(file));
  }, []);

  const removeFile = (index: number) => {
    entriesRef.current = entriesRef.current.filter((_, i) => i !== index);
    setEntries(entriesRef.current);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
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
          borderColor: isDragging
            ? "hsl(var(--primary))"
            : "hsl(var(--border))",
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
          Or click to browse (max {MAX_FILES} files)
        </p>
      </motion.div>

      <AnimatePresence>
        {entries.map((entry, index) => (
          <motion.div
            key={entry.file.name + index}
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
                <p className="text-sm font-medium">{entry.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatSize(entry.file.size)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {entry.status === "uploading" && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
              {entry.status === "done" && (
                <Check className="h-4 w-4 text-green-500" />
              )}
              <button onClick={() => removeFile(index)}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
