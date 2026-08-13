"use client";

import * as React from "react";
import { motion, AnimatePresence, type HTMLMotionProps } from "motion/react";
import { Loader2, Check, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiStateSendButtonProps extends Omit<
  HTMLMotionProps<"button">,
  "children" | "onAnimationStart"
> {
  idleLabel?: string;
  loadingLabel?: string;
  successLabel?: string;
  sendDuration?: number;
  autoResetDelay?: number;
  onSend?: () => void;
  icon?: LucideIcon;
  isLoading?: boolean;
}

const AppButton = React.forwardRef<
  HTMLButtonElement,
  MultiStateSendButtonProps
>(
  (
    {
      idleLabel = "Send Message",
      loadingLabel = "Sending...",
      successLabel = "Sent Successfully!",
      sendDuration = 1800,
      autoResetDelay = 3000,
      onSend,
      icon: Icon,
      isLoading,
      className,
      onClick,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [internalStatus, setInternalStatus] = React.useState<
      "idle" | "loading" | "success"
    >("idle");

    const status =
      isLoading !== undefined
        ? isLoading
          ? "loading"
          : internalStatus === "success"
            ? "success"
            : "idle"
        : internalStatus;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (status !== "idle") return;

      if (isLoading === undefined) {
        setInternalStatus("loading");

        setTimeout(() => {
          setInternalStatus("success");
          if (onSend) onSend();

          if (autoResetDelay > 0) {
            setTimeout(() => {
              setInternalStatus("idle");
            }, autoResetDelay);
          }
        }, sendDuration);
      }

      if (onClick) onClick(e);
    };

    return (
      <motion.button
        ref={ref}
        onClick={handleClick}
        disabled={disabled || status !== "idle"}
        whileHover={{ scale: status === "idle" ? 1.02 : 1 }}
        whileTap={{ scale: status === "idle" ? 0.97 : 1 }}
        className={cn(
          "group relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-xl px-1 py-3 font-medium text-sm transition-all duration-300 select-none outline-none min-w-44 border",
          status === "idle"
            ? "bg-background text-foreground border-border hover:text-primary hover:bg-muted dark:hover:bg-input/50 cursor-pointer"
            : status === "success"
              ? "bg-primary text-primary-foreground border-primary cursor-not-allowed!"
              : "bg-background text-foreground border-border cursor-not-allowed!",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed!",
          disabled && "opacity-60",
          className,
        )}
        {...props}
      >
        <AnimatePresence mode="wait" initial={false}>
          {status === "idle" && (
            <motion.span
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 flex items-center gap-2 font-medium"
            >
              {Icon && (
                <Icon className="size-4 text-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              )}{" "}
              <span>{idleLabel}</span>
            </motion.span>
          )}

          {status === "loading" && (
            <motion.span
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 flex items-center gap-2 font-medium text-primary"
            >
              <Loader2 className="size-4 animate-spin" />
              <span>{loadingLabel}</span>
            </motion.span>
          )}

          {status === "success" && (
            <motion.span
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: "spring", stiffness: 350, damping: 22 }}
              className="relative z-10 flex items-center gap-2 font-medium"
            >
              <Check className="size-4 stroke-[2.5]" />
              <span>{successLabel}</span>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    );
  },
);

AppButton.displayName = "AppButton";

export { AppButton, type MultiStateSendButtonProps };
