"use client";

import { ReactNode, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Hash } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import TableSkeletonRows from "@/loaders/app_table.loader";
import Image from "next/image";

export type AppTableColumn<T> = {
  key: string;
  label: ReactNode;
  center?: boolean;
  className?: string;
  render?: (row: T, index: number) => ReactNode;
};
export type AppTablePageInfo = {
  page: number;
  pageSize: number;
};

type AppTableProps<T> = {
  columns: AppTableColumn<T>[];
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (info: AppTablePageInfo) => void;
  rowKey?: (row: T, index: number) => string | number;
  loading?: boolean;
  emptyMessage?: string;
};

const PAGE_SIZE_OPTIONS = [25, 50, 100];

export function AppTable<T extends Record<string, unknown>>({
  columns,
  data,
  totalCount,
  page,
  pageSize,
  onPageChange,
  rowKey,
  loading,
  emptyMessage = "No records found",
}: AppTableProps<T>) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(page.toString());

  const goToPage = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) {
      setInputValue(page.toString());
      setIsEditing(false);
      return;
    }
    setInputValue(nextPage.toString());
    setIsEditing(false);
    if (nextPage === page) return;
    onPageChange({ page: nextPage, pageSize });
  };

  const changePageSize = (nextPageSize: number) => {
    onPageChange({ page: 1, pageSize: nextPageSize });
  };

  const handleInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(inputValue);
    if (!isNaN(parsed)) {
      goToPage(parsed);
    } else {
      setInputValue(page.toString());
      setIsEditing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(
                    "text-muted-foreground  py-3 px-5",
                    column.center && "text-center",
                  )}
                >
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && <TableSkeletonRows columns={columns.length} rows={5} />}

            {!loading && data.length <= 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} className="!border-0">
                  <NoDataFound />
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              data &&
              data.length > 0 &&
              data.map((row, rowIndex) => (
                <TableRow key={rowKey ? rowKey(row, rowIndex) : rowIndex}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.key}
                      className={cn(
                        "py-5 px-5  !border-0",
                        column.center && "text-center",
                        column.className,
                      )}
                    >
                      {column.render
                        ? column.render(row, rowIndex)
                        : (row[column.key] as ReactNode)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="text-sm text-muted-foreground">
          {totalCount > 0 && (
            <span>
              Showing {totalCount === 1 ? "1 entry" : `${totalCount} entries`}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2  flex-row">
          <Select
            value={String(pageSize)}
            onValueChange={(value) => changePageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-[72px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1 bg-background border rounded-xl p-1.5">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg hover:bg-secondary/80"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center px-1 min-w-[110px] justify-center">
              <AnimatePresence mode="wait">
                {!isEditing ? (
                  <motion.div
                    key="viewer"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    onClick={() => {
                      setInputValue(page.toString());
                      setIsEditing(true);
                    }}
                    className="flex items-center gap-1.5 cursor-pointer hover:bg-secondary/50 px-3 py-1 rounded-md transition-colors group"
                  >
                    <span className="text-sm font-semibold tabular-nums">
                      {page}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      of {totalPages}
                    </span>
                    <Hash className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                  </motion.div>
                ) : (
                  <motion.form
                    key="editor"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onSubmit={handleInputSubmit}
                    className="flex items-center gap-1.5"
                  >
                    <Input
                      autoFocus
                      className="w-12 h-7 py-0 px-1 text-center text-xs tabular-nums focus-visible:ring-1"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onBlur={() => setIsEditing(false)}
                      type="text"
                      inputMode="numeric"
                    />
                    <Button
                      type="submit"
                      variant="secondary"
                      size="sm"
                      className="h-7 px-2 text-[10px] font-bold uppercase tracking-tighter cursor-pointer"
                    >
                      GO
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg hover:bg-secondary/80"
              disabled={page >= totalPages}
              onClick={() => goToPage(page + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NoDataFound({ text = "No Data Found" }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center w-full ">
      <Image
        src="/icons/no_data_found.svg"
        alt="No Data Found"
        height={400}
        width={400}
      />
      <p className="text-sm font-medium text-muted-foreground/80">{text}</p>
    </div>
  );
}
