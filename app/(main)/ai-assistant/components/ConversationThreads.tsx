"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import * as React from "react";
import { useInView } from "react-intersection-observer";
import { Copy, Check, ArrowDown } from "lucide-react";
import type { Message, BatchContent } from "@/stores/chat.store";
import ResumeFileCard from "./ResumeFIleCard";

export type ConversationVariant = "bubbles" | "compact";

type ThreadContextValue = { variant: ConversationVariant };
const ThreadContext = React.createContext<ThreadContextValue>({
  variant: "bubbles",
});

const THREAD_BASE =
  "relative flex h-full flex-col gap-4 overflow-y-auto px-4 py-4";

export type ConversationThreadProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: ConversationVariant;
};

const ConversationThread = React.forwardRef<
  HTMLDivElement,
  ConversationThreadProps
>(function ConversationThread(
  { variant = "bubbles", className, children, ...props },
  forwardedRef,
) {
  const [containerEl, setContainerEl] = React.useState<HTMLDivElement | null>(null);
  const { ref: bottomRef, inView: pinned } = useInView({
    threshold: 0,
    root: containerEl,
  });
  const childCount = React.Children.count(children);
  const hasMountedRef = React.useRef(false);

  React.useImperativeHandle(forwardedRef, function getContainer() {
    return containerEl as HTMLDivElement;
  });

  function scrollToBottom(behavior: ScrollBehavior) {
    if (!containerEl) return;
    containerEl.scrollTo({ top: containerEl.scrollHeight, behavior });
  }

  React.useEffect(
    function autoScroll() {
      if (!containerEl) return;
      if (!hasMountedRef.current) {
        hasMountedRef.current = true;
        scrollToBottom("instant");
        return;
      }
      if (pinned) scrollToBottom("instant");
    },
    [childCount, containerEl],
  );

  function handleJumpToLatest() {
    scrollToBottom("smooth");
  }

  return (
    <ThreadContext.Provider value={{ variant }}>
      <div
        ref={setContainerEl}
        data-slot="conversation-thread"
        data-variant={variant}
        className={`${THREAD_BASE} ${className ?? ""}`}
        {...props}
      >
        <div className="flex flex-col gap-4">
          {children}
          <div ref={bottomRef} />
        </div>
        <AnimatePresence>
          {!pinned && (
            <motion.button
              type="button"
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.9 }}
              transition={{
                type: "spring",
                stiffness: 320,
                damping: 32,
                mass: 0.9,
              }}
              onClick={handleJumpToLatest}
              className="sticky bottom-2 left-1/2 z-raised inline-flex -translate-x-1/2 items-center gap-1.5 self-center rounded-full border border-border bg-popover px-3 py-1.5 text-xs font-medium text-foreground shadow-lg"
            >
              Jump to latest <ArrowDown />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </ThreadContext.Provider>
  );
});
ConversationThread.displayName = "ConversationThread";

const BUBBLE_BY_ROLE: Record<string, string> = {
  user: "bg-primary text-primary-foreground",
  assistant: "bg-muted text-foreground",
  system: "bg-transparent text-muted-foreground italic",
};

export type ConversationMessageProps = {
  message: Message;
};

function ConversationMessage({ message }: ConversationMessageProps) {
  const { variant } = React.useContext(ThreadContext);
  const reduce = useReducedMotion();
  const isUser = message.role === "user";
  const isCompact = variant === "compact";
  const isPersisted = Boolean(message._id);
  
  const [copied, setCopied] = React.useState(false);
  const copyTimeoutRef = React.useRef<
    ReturnType<typeof setTimeout> | undefined
  >(undefined);

  
  React.useEffect(function cleanupCopyTimeout() {
    return function cleanup() {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  async function handleCopy() {
    if (message.content.kind !== "text") return;
    try {
      await navigator.clipboard.writeText(message.content.text);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(function resetCopied() {
        setCopied(false);
      }, 3000);
    } catch (err) {
      console.error("copy failed", err);
    }
  }

  const Wrapper: any = isPersisted ? "div" : motion.div;
  const motionProps = isPersisted
    ? {}
    : {
        initial: reduce ? false : { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { type: "spring", stiffness: 500, damping: 34, mass: 0.5 },
      };

  return (
    <Wrapper
      data-slot="conversation-message"
      data-role={message.role}
      className={`group/msg flex gap-3 ${isUser ? "flex-row-reverse" : ""} ${isCompact ? "gap-2" : ""}`}
      {...motionProps}
    >
      <div
        className={`flex min-w-0 max-w-[80%] flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}
      >
        <div
          className={`rounded-2xl px-3.5 py-2 text-sm leading-6 shadow-2xs ${BUBBLE_BY_ROLE[message.role]} ${isUser ? "rounded-br-md" : "rounded-bl-md"}`}
        >
          <span className="[overflow-wrap:anywhere] whitespace-pre-wrap">
            {message.content.kind === "batch" && (
              <BatchResultView
                content={message.content}
                messageId={message._id}
              />
            )}
            {message.content.kind !== "batch" && <>{message.content.text}</>}
          </span>
        </div>
        {message.role !== "system" && (
          <div
            className={`flex gap-0.5 px-1 opacity-0 transition-opacity group-hover/msg:opacity-100 ${isUser ? "flex-row-reverse" : ""}`}
          >
            <button
              type="button"
              aria-label="Copy"
              onClick={handleCopy}
              className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <AnimatePresence mode="wait" initial={false}>
                {copied && (
                  <motion.span
                    key="check"
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Check className="size-3.5 text-primary" />
                  </motion.span>
                )}
                {!copied && (
                  <motion.span
                    key="copy"
                    initial={{ opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ duration: 0.15 }}
                  >
                    <Copy className="size-3.5" />
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        )}
      </div>
    </Wrapper>
  );
}

function TypingIndicator() {
  return (
    <div className="flex flex-row gap-2 px-1">
      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
      <div className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:-.3s]" />
      <div className="w-2 h-2 rounded-full bg-accent-foreground animate-bounce [animation-delay:-.5s]" />
    </div>
  );
}
function BatchResultView({
  content,
  messageId,
}: {
  content: BatchContent;
  messageId?: string;
}) {
  if (content.resume_rework?.error) {
    return (
      <p className="text-sm text-destructive">{content.resume_rework.error}</p>
    );
  }

  if (content.resume_rework?.has_file) {
    if (!messageId) return null;
    return <ResumeFileCard messageId={messageId} />;
  }

  if (content.cover_letter) {
    return (
      <p className="text-sm whitespace-pre-wrap">
        {content.cover_letter.cover_letter}
      </p>
    );
  }

  if (content.job_match) {
    return <JobMatchCard jobMatch={content.job_match} />;
  }

  return null;
}

function JobMatchCard({
  jobMatch,
}: {
  jobMatch: NonNullable<BatchContent["job_match"]>;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -32 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 28, mass: 0.9 }}
      className="rounded-xl border border-border bg-card p-3"
    >
      <p className="mb-2 text-xs font-semibold text-foreground">Job Match</p>
      {jobMatch.error && (
        <p className="text-xs text-destructive">{jobMatch.error}</p>
      )}
      {!jobMatch.error && (
        <div className="flex flex-col gap-3 text-sm text-foreground">
          <div className="flex items-center gap-2">
            <p className="text-2xl font-semibold tabular-nums">
              {jobMatch.match_score}
              <span className="text-sm text-muted-foreground">/100</span>
            </p>
          </div>
          <p className="leading-6">{jobMatch.summary}</p>

          {jobMatch.matched_keywords.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {jobMatch.matched_keywords.map((k) => {
                return (
                  <span
                    key={k}
                    className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-600 dark:text-emerald-400"
                  >
                    {k}
                  </span>
                );
              })}
            </div>
          )}

          {jobMatch.missing_keywords.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {jobMatch.missing_keywords.map((k) => {
                return (
                  <span
                    key={k}
                    className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive"
                  >
                    {k}
                  </span>
                );
              })}
            </div>
          )}

          {jobMatch.strengths.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-muted-foreground">
                Strengths
              </p>
              <ul className="flex flex-col gap-1 pl-4 text-sm leading-6 list-disc">
                {jobMatch.strengths.map((s, i) => {
                  return <li key={i}>{s}</li>;
                })}
              </ul>
            </div>
          )}

          {jobMatch.gaps.length > 0 && (
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-muted-foreground">
                Gaps
              </p>
              <ul className="flex flex-col gap-1 pl-4 text-sm leading-6 list-disc">
                {jobMatch.gaps.map((g, i) => {
                  return <li key={i}>{g}</li>;
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export {
  ConversationMessage,
  ConversationThread,
  BatchResultView,
  TypingIndicator,
};
