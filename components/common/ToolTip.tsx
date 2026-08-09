import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

type TooltipSide = "top" | "bottom" | "right" | "left";

interface TooltipProps {
  content: React.ReactNode;
  side?: TooltipSide;
  children: React.ReactNode;
}

const sideClasses: Record<TooltipSide, string> = {
  top: "bottom-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2",
  bottom: "top-[calc(100%+0.5rem)] left-1/2 -translate-x-1/2",
  right: "left-[calc(100%+0.5rem)] top-1/2 -translate-y-1/2",
  left: "right-[calc(100%+0.5rem)] top-1/2 -translate-y-1/2",
};

const initialOffset: Record<TooltipSide, { x?: number; y?: number }> = {
  top: { y: 6 },
  bottom: { y: -6 },
  right: { x: -6 },
  left: { x: 6 },
};

export default function Tooltip({
  content,
  side = "top",
  children,
}: TooltipProps) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      <AnimatePresence>
        {open && (
          <motion.span
            role="tooltip"
            initial={{ opacity: 0, scale: 0.9, ...initialOffset[side] }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, ...initialOffset[side] }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1 text-xs font-medium text-background shadow-md",
              sideClasses[side],
            )}
          >
            {content}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
