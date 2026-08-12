"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { motion, AnimatePresence } from "motion/react";

type TrackerRow = {
  _id: string;
  title?: string;
  page_title?: string;
  site_name?: string;
  url: string;
  status: string;
  applied_on: string;
};

type JobTrackerTableProps = {
  docs: TrackerRow[];
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
};

export default function JobTrackerTable({
  docs,
  total,
  page,
  limit,
  onPageChange,
}: JobTrackerTableProps) {
  const total_pages = Math.max(1, Math.ceil(total / limit));
  const range_start = total === 0 ? 0 : (page - 1) * limit + 1;
  const range_end = Math.min(page * limit, total);
  const pages = Array.from({ length: total_pages }, (_, i) => i + 1);

  return (
    <div className="border border-border rounded-xl overflow-hidden bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead>Job Title</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Applied On</TableHead>
            <TableHead>Link</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence initial={false}>
            {docs.map((doc) => (
              <motion.tr
                key={doc._id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
              >
                <TableCell className="font-medium text-foreground">
                  {doc.title || doc.page_title}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {doc.site_name || "—"}
                </TableCell>
                <TableCell className="text-muted-foreground capitalize">
                  {doc.status}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(doc.applied_on).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 text-foreground hover:text-muted-foreground"
                  >
                    View
                  </a>
                </TableCell>
              </motion.tr>
            ))}
          </AnimatePresence>
        </TableBody>
      </Table>

      <div className="flex items-center justify-between px-5 py-3 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Showing {range_start}-{range_end} of {total}
        </p>

        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => page > 1 && onPageChange(page - 1)}
                className={page <= 1 ? "pointer-events-none opacity-40" : ""}
              />
            </PaginationItem>
            {pages.map((p) => (
              <PaginationItem key={p}>
                <PaginationLink
                  onClick={() => onPageChange(p)}
                  isActive={p === page}
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() => page < total_pages && onPageChange(page + 1)}
                className={
                  page >= total_pages ? "pointer-events-none opacity-40" : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}