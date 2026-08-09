import { AnimatePresence, motion } from "motion/react";
import * as React from "react";

export type PromptComposerVariant = "comfortable" | "compact" | "minimal";

export type PromptComposerProps = Omit<
  React.FormHTMLAttributes<HTMLFormElement>,
  "onSubmit"
> & {
  /** Controlled textarea value. */
  value?: string;
  /** Uncontrolled initial value. */
  defaultValue?: string;
  /** Fired on every keystroke. */
  onValueChange?: (value: string) => void;
  /** Fired on submit (⌘/Ctrl+Enter or send button) with the text + attachments. */
  onSend?: (value: string) => void;
  /** When streaming, the send button morphs into a stop button. */
  isStreaming?: boolean;
  /** Fired when the stop button is pressed while streaming. */
  onStop?: () => void;
  placeholder?: string;
  variant?: PromptComposerVariant;
  /** Visual density of the textarea (max rows before scroll). */
  maxRows?: number;
  disabled?: boolean;
  /** Available models for the inline picker. Hidden when omitted. */
  models?: string[];
  model?: string;
  onModelChange?: (model: string) => void;
};

const PANEL_BASE =
  "group/composer relative flex w-full flex-col gap-2 rounded-2xl border border-border bg-card/80 p-2.5 shadow-sm backdrop-blur-md transition-[box-shadow,border-color] focus-within:border-ring focus-within:shadow-md";

const variantPanel: Record<PromptComposerVariant, string> = {
  comfortable: "",
  compact: "gap-1.5 p-2",
  minimal: "border-transparent bg-muted/40 shadow-none focus-within:shadow-sm",
};

const TEXTAREA_BASE =
  "w-full resize-none bg-transparent px-2 pt-1.5 text-sm leading-6 text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50";

const PromptComposer = React.forwardRef<HTMLFormElement, PromptComposerProps>(
  (
    {
      value,
      defaultValue = "",
      onValueChange,
      onSend,
      isStreaming = false,
      onStop,
      placeholder = "Ask anything…",
      variant = "comfortable",
      maxRows = 8,
      disabled = false,

      models,
      model,
      onModelChange,
      className,
      ...props
    },
    ref,
  ) => {
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = React.useState(defaultValue);
    const text = isControlled ? value : internalValue;

    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const setText = (next: string) => {
      if (!isControlled) setInternalValue(next);
      onValueChange?.(next);
    };

    // Auto-grow the textarea up to maxRows.
    // biome-ignore lint/correctness/useExhaustiveDependencies: re-measure on value change
    React.useLayoutEffect(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.style.height = "auto";
      const lineHeight = 24;
      const max = lineHeight * maxRows;
      el.style.height = `${Math.min(el.scrollHeight, max)}px`;
      el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
    }, [text, maxRows]);

    const canSend = text.trim().length > 0;

    const submit = () => {
      if (isStreaming) {
        onStop?.();
        return;
      }
      if (!canSend || disabled) return;
      onSend?.(text);
      setText("");
    };

    return (
      <form
        ref={ref}
        data-slot="prompt-composer"
        data-variant={variant}
        data-streaming={isStreaming ? "" : undefined}
        className={`${PANEL_BASE} ${variantPanel[variant]}  ${className ?? ""}`}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        {...props}
      >
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          disabled={disabled}
          placeholder={placeholder}
          aria-label="Prompt"
          className={TEXTAREA_BASE}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              submit();
            }
          }}
        />

        <div className="flex items-center justify-end gap-2 px-1">
          {text.length > 0 ? (
            <span className="text-xs tabular-nums text-muted-foreground">
              {text.length}
            </span>
          ) : null}
          <button
            type={isStreaming ? "button" : "submit"}
            disabled={!isStreaming && (!canSend || disabled)}
            aria-label={isStreaming ? "Stop generating" : "Send message"}
            onClick={isStreaming ? onStop : undefined}
            className="relative inline-flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-[transform,opacity,background-color] hover:bg-primary/90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
          >
            <AnimatePresence mode="wait" initial={false}>
              {isStreaming ? (
                <motion.span
                  key="stop"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.15 }}
                >
                  <StopIcon className="size-3.5" />
                </motion.span>
              ) : (
                <motion.span
                  key="send"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.15 }}
                >
                  <ArrowUpIcon className="size-4" />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </form>
    );
  },
);
PromptComposer.displayName = "PromptComposer";

type IconProps = { className?: string };
const svg = "0 0 24 24";
function ArrowUpIcon({ className }: IconProps) {
  return (
    <svg
      viewBox={svg}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  );
}
function StopIcon({ className }: IconProps) {
  return (
    <svg
      viewBox={svg}
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

export { PromptComposer };
