"use client";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUp, ArrowDown } from "lucide-react";

export function SortFilterButton({ value }: { value: "1" | "-1" }) {
  const Icon = value === "-1" ? ArrowDown : ArrowUp;

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={value}
        initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="flex items-center justify-center"
      >
        <Icon className="h-4 w-4" />
      </motion.span>
    </AnimatePresence>
  );
}
