"use client";
import { FileText, Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { api } from "@/utils/axios";

export default function ResumeFileCard({ messageId }: { messageId: string }) {
  console.log("iu gydf");
  const [downloading, setDownloading] = useState<"docx" | "pdf" | null>(null);

  async function handleDownload(format: "docx" | "pdf") {
    setDownloading(format);
    try {
      const res = await api.post("/ai/download-resume", {
        message_id: messageId,

        format,
      });
      window.open(res.data.data.url, "_blank");
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(null);
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
        <FileText className="size-5 text-muted-foreground" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">Reworked Resume</p>
        <p className="text-xs text-muted-foreground">Ready to download</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => handleDownload("docx")}
          disabled={downloading !== null}
          className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent disabled:opacity-50"
        >
          {downloading === "docx" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Download className="size-3.5" />
          )}
          DOCX
        </button>
        <button
          onClick={() => handleDownload("pdf")}
          disabled={downloading !== null}
          className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent disabled:opacity-50"
        >
          {downloading === "pdf" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Download className="size-3.5" />
          )}
          PDF
        </button>
      </div>
    </div>
  );
}
