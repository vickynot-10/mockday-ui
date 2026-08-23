"use client";

import { FileText, Download, Loader2 } from "lucide-react";
import { useState } from "react";
import {
  useDownloadResume,
  DownloadResumeType,
} from "@/hooks/queries/useAI";

export default function ResumeFileCard({
  messageId,
}: {
  messageId: string;
}) {
  const [selectedType, setSelectedType] =
    useState<DownloadResumeType["type"] | null>(null);

  const { mutate, isPending } = useDownloadResume();

  function handleDownload(type: DownloadResumeType["type"]) {
    setSelectedType(type);

    mutate(
      {
        type,
        message_id: messageId,
      },
      {
        onSettled: () => {
          setSelectedType(null);
        },
      }
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
        <FileText className="size-5 text-muted-foreground" />
      </div>

      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">
          Reworked Resume
        </p>
        <p className="text-xs text-muted-foreground">
          Ready to download
        </p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => handleDownload("docx")}
          disabled={isPending}
          className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent disabled:opacity-50"
        >
          {isPending && selectedType === "docx" ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Download className="size-3.5" />
          )}
          DOCX
        </button>

        <button
          onClick={() => handleDownload("pdf")}
          disabled={isPending}
          className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent disabled:opacity-50"
        >
          {isPending && selectedType === "pdf" ? (
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