"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import * as React from "react";
import { ThumbsUp, ThumbsDown, Copy, Check } from "lucide-react";

export type ConversationVariant = "bubbles" | "compact";
export type MessageRole = "user" | "assistant" | "system";

type ThreadContextValue = { variant: ConversationVariant };
const ThreadContext = React.createContext<ThreadContextValue>({
  variant: "bubbles",
});

export type ConversationThreadProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: ConversationVariant;
  autoScroll?: boolean;
};

const THREAD_BASE =
  "relative flex h-full flex-col gap-4 overflow-y-auto px-4 py-4";

const ConversationThread = React.forwardRef<
  HTMLDivElement,
  ConversationThreadProps
>(
  (
    { variant = "bubbles", autoScroll = true, className, children, ...props },
    forwardedRef,
  ) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const contentRef = React.useRef<HTMLDivElement>(null);
    React.useImperativeHandle(
      forwardedRef,
      () => ref.current as HTMLDivElement,
    );
    const [pinned, setPinned] = React.useState(true);
    const pinnedRef = React.useRef(true);

    const setPinnedBoth = React.useCallback((next: boolean) => {
      pinnedRef.current = next;
      setPinned(next);
    }, []);

    const scrollToBottom = React.useCallback((behavior: ScrollBehavior) => {
      const el = ref.current;
      if (!el) return;
      if (typeof el.scrollTo === "function") {
        el.scrollTo({ top: el.scrollHeight, behavior });
      } else {
        el.scrollTop = el.scrollHeight;
      }
    }, []);

    const childCount = React.Children.count(children);
    // biome-ignore lint/correctness/useExhaustiveDependencies: re-pin when a message is added
    React.useEffect(() => {
      if (autoScroll && pinnedRef.current) scrollToBottom("instant");
    }, [childCount, autoScroll, scrollToBottom]);

    React.useEffect(() => {
      if (!autoScroll) return;
      const content = contentRef.current;
      if (!content || typeof ResizeObserver === "undefined") return;
      const ro = new ResizeObserver(() => {
        if (pinnedRef.current) scrollToBottom("instant");
      });
      ro.observe(content);
      return () => ro.disconnect();
    }, [autoScroll, scrollToBottom]);

    return (
      <ThreadContext.Provider value={{ variant }}>
        <div
          ref={ref}
          data-slot="conversation-thread"
          data-variant={variant}
          className={`${THREAD_BASE} ${className ?? ""}`}
          onScroll={(e) => {
            const el = e.currentTarget;
            const atBottom =
              el.scrollHeight - el.scrollTop - el.clientHeight < 48;
            setPinnedBoth(atBottom);
          }}
          {...props}
        >
          <div ref={contentRef} className="flex flex-col gap-4">
            {children}
          </div>
          <AnimatePresence>
            {!pinned ? (
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
                onClick={() => {
                  setPinnedBoth(true);
                  scrollToBottom("smooth");
                }}
                className="sticky bottom-2 left-1/2 z-raised inline-flex -translate-x-1/2 items-center gap-1.5 self-center rounded-full border border-border bg-popover px-3 py-1.5 text-xs font-medium text-foreground shadow-lg"
              >
                Jump to latest
                <ArrowDownIcon className="size-3.5" />
              </motion.button>
            ) : null}
          </AnimatePresence>
        </div>
      </ThreadContext.Provider>
    );
  },
);
ConversationThread.displayName = "ConversationThread";

export type ConversationMessageProps = React.HTMLAttributes<HTMLDivElement> & {
  role: MessageRole;
  name?: string;
  timestamp?: string;
  streaming?: boolean;
  conversation_id?: string;
  message_id?: string;
  copyText?: string;
};

const BUBBLE_BY_ROLE: Record<MessageRole, string> = {
  user: "bg-primary text-primary-foreground",
  assistant: "bg-muted text-foreground",
  system: "bg-transparent text-muted-foreground italic",
};

const ConversationMessage = React.forwardRef<
  HTMLDivElement,
  ConversationMessageProps
>(
  (
    {
      role,
      name,
      timestamp,
      streaming = false,
      conversation_id,
      message_id,
      copyText,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const { variant } = React.useContext(ThreadContext);
    const reduce = useReducedMotion();
    const isUser = role === "user";
    const isCompact = variant === "compact";
    const [copied, setCopied] = React.useState(false);
    const copyTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    React.useEffect(() => {
      return () => {
        if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      };
    }, []);

    const handleCopy = async () => {
      if (!copyText) return;
      try {
        await navigator.clipboard.writeText(copyText);
        setCopied(true);
        if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
        copyTimeoutRef.current = setTimeout(() => setCopied(false), 3000);
      } catch (err) {
        console.error("copy failed", err);
      }
    };

  
    const isPersisted = Boolean(message_id);

    const Wrapper: any = isPersisted ? "div" : motion.div;
    const motionProps = isPersisted
      ? {}
      : {
          initial: reduce ? false : { opacity: 0, y: 8 },
          animate: { opacity: 1, y: 0 },
          transition: {
            type: "spring",
            stiffness: 500,
            damping: 34,
            mass: 0.5,
          },
        };
    return (
      <Wrapper
        ref={ref}
        data-slot="conversation-message"
        data-role={role}
        className={`group/msg flex gap-3 ${isUser ? "flex-row-reverse" : ""} ${isCompact ? "gap-2" : ""} ${className ?? ""}`}
        {...motionProps}
        {...props}
      >
        <div
          className={`flex min-w-0 max-w-[80%] flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}
        >
          {(name || timestamp) && !isCompact ? (
            <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
              {name ? (
                <span className="font-medium text-foreground">{name}</span>
              ) : null}
              {timestamp ? (
                <span className="tabular-nums">{timestamp}</span>
              ) : null}
            </div>
          ) : null}
          <div
            className={`rounded-2xl px-3.5 py-2 text-sm leading-6 shadow-2xs ${BUBBLE_BY_ROLE[role]} ${isUser ? "rounded-br-md" : "rounded-bl-md"}`}
          >
            <span className="[overflow-wrap:anywhere] whitespace-pre-wrap">
              {children}
              {streaming ? (
                <span className="ml-0.5 inline-block h-[1.05em] w-[2px] -translate-y-px animate-pulse bg-current align-middle motion-reduce:animate-none" />
              ) : null}
            </span>
          </div>
          {role !== "system" ? (
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
                  {copied ? (
                    <motion.span
                      key="check"
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Check className="size-3.5 text-primary" />
                    </motion.span>
                  ) : (
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
          ) : null}
        </div>
      </Wrapper>
    );
  },
);
ConversationMessage.displayName = "ConversationMessage";

export type StreamingTextProps = {
  text: string;
  chunk?: number;
  speed?: number;
  onDone?: () => void;
};

function StreamingText({
  text,
  chunk = 2,
  speed = 24,
  onDone,
}: StreamingTextProps) {
  const reduce = useReducedMotion();
  const [count, setCount] = React.useState(reduce ? text.length : 0);

  React.useEffect(() => {
    if (reduce) {
      setCount(text.length);
      onDone?.();
      return;
    }
    setCount(0);
    let current = 0;
    const id = setInterval(() => {
      current = Math.min(current + chunk, text.length);
      setCount(current);
      if (current >= text.length) {
        clearInterval(id);
        onDone?.();
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, chunk, speed, reduce, onDone]);

  return <>{text.slice(0, count)}</>;
}

type IconProps = { className?: string };
function ArrowDownIcon({ className }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  );
}

import type { BatchContent } from "@/stores/chat.store";

function BatchResultView({ content }: { content: BatchContent }) {
  const sections: { key: string; node: React.ReactNode }[] = [];

  if (content.resume_rework) {
    sections.push({
      key: "resume_rework",
      node: (
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="mb-2 text-xs font-semibold text-foreground">
            Resume Rework
          </p>
          {content.resume_rework.error ? (
            <p className="text-xs text-destructive">
              {content.resume_rework.error}
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {content.resume_rework.paragraphs.map((p) => (
                <p key={p.id} className="text-sm leading-6 text-foreground">
                  {p.text}
                </p>
              ))}
            </div>
          )}
        </div>
      ),
    });
  }

  if (content.cover_letter) {
    sections.push({
      key: "cover_letter",
      node: (
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="mb-2 text-xs font-semibold text-foreground">
            Cover Letter
          </p>
          {content.cover_letter.error ? (
            <p className="text-xs text-destructive">
              {content.cover_letter.error}
            </p>
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
              {content.cover_letter.cover_letter}
            </p>
          )}
        </div>
      ),
    });
  }

  if (content.job_match) {
    const jm = content.job_match;
    sections.push({
      key: "job_match",
      node: (
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="mb-2 text-xs font-semibold text-foreground">
            Job Match
          </p>
          {jm.error ? (
            <p className="text-xs text-destructive">{jm.error}</p>
          ) : (
            <div className="flex flex-col gap-2 text-sm text-foreground">
              <p className="text-2xl font-semibold tabular-nums">
                {jm.match_score}
                <span className="text-sm text-muted-foreground">/100</span>
              </p>
              <p className="leading-6">{jm.summary}</p>
              {jm.matched_keywords.length > 0 ? (
                <p className="text-xs text-muted-foreground">
                  Matched: {jm.matched_keywords.join(", ")}
                </p>
              ) : null}
              {jm.missing_keywords.length > 0 ? (
                <p className="text-xs text-muted-foreground">
                  Missing: {jm.missing_keywords.join(", ")}
                </p>
              ) : null}
            </div>
          )}
        </div>
      ),
    });
  }

  return (
    <div className="flex w-full flex-col gap-2">
      {sections.map((s, i) => (
        <motion.div
          key={s.key}
          initial={{ opacity: 0, x: -32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 28,
            mass: 0.9,
            delay: i * 0.12,
          }}
        >
          {s.node}
        </motion.div>
      ))}
    </div>
  );
}

export {
  ConversationMessage,
  ConversationThread,
  StreamingText,
  BatchResultView,
};
